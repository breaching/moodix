/**
 * Utility helper functions for Moodix
 */

/**
 * Get score color class based on value (0-10)
 */
export const getScoreColor = (val: number): string => {
  if (val <= 3) return 'text-rose-500';
  if (val <= 6) return 'text-amber-400';
  return 'text-emerald-400';
};

/**
 * Get score background class based on value (0-10)
 */
export const getScoreBg = (val: number): string => {
  if (val <= 3) return 'bg-rose-500';
  if (val <= 6) return 'bg-amber-500';
  return 'bg-emerald-500';
};

/**
 * Get mood color class
 */
export const getMoodColor = (mood: number | string | undefined): string => {
  const val = typeof mood === 'string' ? parseInt(mood, 10) : mood;
  if (!val) return 'text-[var(--text-muted)]';
  if (val <= 3) return 'text-rose-400';
  if (val <= 6) return 'text-amber-400';
  return 'text-emerald-400';
};

/**
 * Get mood background class
 */
export const getMoodBgClass = (mood: number | string | undefined): string => {
  const val = typeof mood === 'string' ? parseInt(mood, 10) : mood;
  if (!val) return 'bg-[var(--text-muted)]/30';
  if (val <= 3) return 'mood-low';
  if (val <= 6) return 'mood-medium';
  return 'mood-high';
};

/**
 * Format date to locale string
 */
export const formatDate = (
  date: string | Date,
  locale: 'fr' | 'en' = 'fr',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US';
  return dateObj.toLocaleDateString(localeStr, options);
};

/**
 * Get day name from date
 */
export const getDayName = (date: string | Date, locale: 'fr' | 'en' = 'fr'): string => {
  return formatDate(date, locale, { weekday: 'long' });
};

/**
 * Check if time string falls within hour column index
 */
export const isTimeInColumn = (timeStr: string | undefined, colIndex: number): boolean => {
  if (!timeStr) return false;
  const hour = parseInt(timeStr.split(':')[0], 10);
  return hour === (colIndex + 18) % 24;
};

/**
 * Generate unique ID
 */
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

/**
 * Check if two objects are deeply equal
 */
export const deepEqual = <T>(a: T, b: T): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

/**
 * Safe parse JSON with fallback
 */
export const safeParseJSON = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * Get consumable color CSS variable value from consumable key
 */
export const getConsumableColor = (key: string): string => {
  const colorMap: Record<string, string> = {
    exercise: 'var(--icon-exercise)',
    caffeine: 'var(--icon-caffeine)',
    cannabis: 'var(--icon-cannabis)',
    medication: 'var(--icon-medication)',
    custom: 'var(--icon-custom)',
  };
  return colorMap[key] || 'var(--text-main)';
};

/**
 * Get consumable background CSS value from consumable key
 */
export const getConsumableBg = (key: string): string => {
  const bgMap: Record<string, string> = {
    exercise: 'color-mix(in srgb, var(--icon-exercise) 20%, transparent)',
    caffeine: 'color-mix(in srgb, var(--icon-caffeine) 20%, transparent)',
    cannabis: 'color-mix(in srgb, var(--icon-cannabis) 20%, transparent)',
    medication: 'color-mix(in srgb, var(--icon-medication) 20%, transparent)',
    custom: 'color-mix(in srgb, var(--icon-custom) 20%, transparent)',
  };
  return bgMap[key] || 'transparent';
};

/**
 * Get consumable color CSS class name from consumable key
 */
export const getConsumableColorClass = (key: string): string => {
  const classMap: Record<string, string> = {
    exercise: 'icon-exercise',
    caffeine: 'icon-caffeine',
    cannabis: 'icon-cannabis',
    medication: 'icon-medication',
    custom: 'icon-custom',
  };
  return classMap[key] || '';
};
