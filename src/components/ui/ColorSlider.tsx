import { memo } from 'react';
import type { ColorSliderProps } from '@/types';
import { getScoreColor, getScoreBg } from '@/utils/helpers';

/**
 * Colored range slider component with visual feedback
 */
export const ColorSlider = memo(function ColorSlider({
  label,
  value,
  onChange,
}: ColorSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex items-center gap-3" role="group" aria-label={`${label} slider`}>
      <span className={`text-xs font-bold w-14 ${getScoreColor(value)}`}>{label}</span>
      <div className="flex-1 h-2 bg-[var(--bg-card)] rounded-full relative">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-200 ${getScoreBg(value)}`}
          style={{ width: `${value * 10}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min="0"
          max="10"
          value={value || 0}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          aria-label={`${label}: ${value} sur 10`}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
        />
        <div
          className="absolute -top-1 w-4 h-4 bg-white rounded-full shadow pointer-events-none transition-all"
          style={{ left: `calc(${value * 10}% - 8px)` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-xs font-bold w-5 text-right text-[var(--text-muted)]" aria-hidden="true">
        {value}
      </span>
    </div>
  );
});

export default ColorSlider;
