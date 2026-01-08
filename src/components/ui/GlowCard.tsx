import { useRef, useCallback, memo } from 'react';
import type { GlowCardProps } from '@/types';

/**
 * Card component with cursor-following glow effect
 */
export const GlowCard = memo(function GlowCard({ children, className = '' }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !borderRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    borderRef.current.style.opacity = '1';
    borderRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, var(--primary), transparent 40%)`;
    cardRef.current.style.transform = 'translateY(-4px)';
    cardRef.current.style.boxShadow =
      '0 20px 40px -15px rgba(0,0,0,0.3), 0 0 40px var(--primary-glow)';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (borderRef.current && cardRef.current) {
      borderRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(0)';
      cardRef.current.style.boxShadow = '';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative border border-[var(--glass-border)] ${className}`}
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: 'var(--glass-bg)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow border that follows cursor */}
      <div
        ref={borderRef}
        className="absolute -inset-[1px] rounded-2xl pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: 0,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '2px',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
});

export default GlowCard;
