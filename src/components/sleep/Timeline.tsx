import { memo } from 'react';
import { DISPLAY_HOURS } from '@/utils/constants';
import { Icons } from '@/components/ui';

interface TimelineProps {
  sleepHours: boolean[];
  onChange: (hours: boolean[]) => void;
  title: string;
}

/**
 * 24-hour sleep timeline component
 */
export const Timeline = memo(function Timeline({ sleepHours, onChange, title }: TimelineProps) {
  const toggleHour = (index: number) => {
    const newHours = [...sleepHours];
    newHours[index] = !newHours[index];
    onChange(newHours);
  };

  const sleepCount = sleepHours.filter(Boolean).length;

  return (
    <div className="relative" role="group" aria-label={title}>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none rounded-2xl"
        aria-hidden="true"
      />

      <div className="flex justify-between items-end mb-4 relative z-10">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase flex items-center gap-2">
          <Icons.Clock className="w-4 h-4" />
          {title}
        </h3>
        <span className="text-xs text-[var(--primary)] font-bold px-2 py-0.5 rounded-md bg-[var(--primary)]/10" aria-live="polite">
          {sleepCount}h
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 no-scrollbar relative z-10">
        <div className="flex min-w-max pt-2 pb-2" role="list">
          {DISPLAY_HOURS.map((h, i) => {
            const isActive = sleepHours[i];
            const isPrevActive = i > 0 && sleepHours[i - 1];
            const isNextActive = i < 23 && sleepHours[i + 1];
            const isConnected = isActive && (isPrevActive || isNextActive);

            let roundedClass = 'rounded-lg';
            if (isActive) {
              if (isPrevActive && isNextActive) roundedClass = 'rounded-none';
              else if (isPrevActive) roundedClass = 'rounded-r-lg rounded-l-none';
              else if (isNextActive) roundedClass = 'rounded-l-lg rounded-r-none';
            }

            return (
              <div key={i} className="flex flex-col items-center group w-9" role="listitem">
                <button
                  onClick={() => toggleHour(i)}
                  className={`timeline-slot h-16 w-full transition-all duration-200 relative ripple-container ${
                    isActive
                      ? `timeline-slot-active ${roundedClass} ${isConnected ? 'timeline-slot-connected' : ''}`
                      : 'bg-input hover:bg-[var(--bg-elevated)]'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${h}: ${isActive ? 'Sommeil' : 'Éveillé'}`}
                >
                  {/* Glow effects for active slots */}
                  {isActive && !isPrevActive && (
                    <span
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--primary)] rounded-full opacity-50 blur-sm"
                      aria-hidden="true"
                    />
                  )}
                  {isActive && !isNextActive && (
                    <span
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--primary)] rounded-full opacity-50 blur-sm"
                      aria-hidden="true"
                    />
                  )}
                </button>
                <span
                  className={`text-[9px] mt-2 font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--primary)] font-bold'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                  }`}
                  aria-hidden="true"
                >
                  {h}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default Timeline;
