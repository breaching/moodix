import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useSettingsStore } from '@/stores';

const plasmaColors: Record<string, string> = {
  violet: '#8b5cf6',
  blue: '#3b82f6',
  green: '#10b981',
  rose: '#f43f5e',
  orange: '#f97316',
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Use mediump for better mobile performance (no visible difference with blur)
const fragment = `#version 300 es
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  // 30 iterations for better performance during UI transitions
  for (vec2 r = iResolution.xy, Q; ++i < 30.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

// Check if WebGL is supported
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('webgl2'))
    );
  } catch {
    return false;
  }
}

/**
 * Persistent plasma background that NEVER remounts.
 * Color changes are handled via Zustand subscribe, not component remounts.
 */
export function PlasmaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize WebGL once and subscribe to color changes
  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    // Skip if WebGL is not supported
    if (!isWebGLSupported()) {
      console.warn('WebGL not supported, skipping plasma background');
      return;
    }

    const initialColor = plasmaColors[useSettingsStore.getState().settings.colorScheme] || '#8b5cf6';
    const customColorRgb = hexToRgb(initialColor);

    // Very low DPR for smooth performance - plasma is decorative, quality not critical
    const isMobile = window.innerWidth < 768;
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: isMobile ? 0.35 : 0.5,
      });
    } catch (e) {
      console.warn('Failed to create WebGL renderer:', e);
      return;
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerEl.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: 1.0 },
        uSpeed: { value: 0.5 * 0.4 },
        uDirection: { value: 1.0 },
        uScale: { value: 1.1 },
        uOpacity: { value: 0.6 },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: 1.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Subscribe to color scheme changes using Zustand's subscribe
    // This ensures color updates work immediately when the user changes the theme
    let previousColorScheme = useSettingsStore.getState().settings.colorScheme;
    useSettingsStore.subscribe((state) => {
      const newColorScheme = state.settings.colorScheme;
      if (newColorScheme !== previousColorScheme) {
        previousColorScheme = newColorScheme;
        const color = plasmaColors[newColorScheme] || '#8b5cf6';
        const rgb = hexToRgb(color);
        const colorUniform = program.uniforms.uCustomColor.value as Float32Array;
        colorUniform[0] = rgb[0];
        colorUniform[1] = rgb[1];
        colorUniform[2] = rgb[2];
      }
    });
    // Note: No unsubscribe needed since this component never unmounts

    const mousePos = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = mousePos.x;
      mouseUniform[1] = mousePos.y;
    };

    containerEl.addEventListener('mousemove', handleMouseMove);

    const setSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerEl);
    setSize();

    // FPS limiting for better battery life and smoother tab transitions
    const targetFps = isMobile ? 20 : 24;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;
    const t0 = performance.now();
    let isRendering = true;

    // Pause rendering briefly when document is not focused or during heavy operations
    const handleVisibilityChange = () => {
      isRendering = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const loop = (t: number) => {
      requestAnimationFrame(loop);

      // Skip if not rendering
      if (!isRendering) return;

      // Skip frames to maintain target FPS
      const elapsed = t - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = t - (elapsed % frameInterval);

      const timeValue = (t - t0) * 0.001;
      program.uniforms.iTime.value = timeValue;
      renderer.render({ scene: mesh });
    };
    requestAnimationFrame(loop);

    // This effect should NEVER cleanup - we want the plasma to persist forever
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none no-print"
      style={{
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  );
}

export default PlasmaBackground;
