import { useState, memo, type ChangeEvent, type KeyboardEvent } from 'react';
import type { MultiTimeInputProps } from '@/types';
import { Icons } from '@/components/ui';

/**
 * Input component for multiple time entries
 */
export const MultiTimeInput = memo(function MultiTimeInput({
  label,
  icon: Icon,
  values,
  onChange,
  color,
  iconClass = '',
}: MultiTimeInputProps) {
  const [time, setTime] = useState('');

  const handleAdd = () => {
    if (time && !values.includes(time)) {
      onChange([...values, time].sort());
      setTime('');
    }
  };

  const handleRemove = (val: string) => {
    onChange(values.filter((v) => v !== val));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Determine if this is bedtime (moon) or wakeup (sun) based on color class
  const isBedtime = color.includes('sleep');

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-full border border-[var(--border)]"
      role="group"
      aria-label={label}
    >
      {/* Background gradient based on type */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isBedtime
            ? 'bg-gradient-to-br from-[var(--icon-sleep)]/15 via-[var(--glass-bg)] to-[var(--glass-bg)]'
            : 'bg-gradient-to-br from-[var(--icon-wake)]/15 via-[var(--glass-bg)] to-[var(--glass-bg)]'
        }`}
      />

      {/* Content */}
      <div className="relative p-4 flex flex-col h-full rounded-2xl backdrop-blur-sm">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              isBedtime
                ? 'bg-gradient-to-br from-[var(--icon-sleep)] to-[var(--icon-sleep)]/70 shadow-[var(--icon-sleep)]/30'
                : 'bg-gradient-to-br from-[var(--icon-wake)] to-[var(--icon-wake)]/70 shadow-[var(--icon-wake)]/30'
            }`}
          >
            <span className={`${iconClass} text-white`} aria-hidden="true">
              <Icon className="w-5 h-5" />
            </span>
          </div>
          <div>
            <span className={`font-bold text-sm ${color}`}>{label}</span>
            <div className="text-[10px] text-[var(--text-muted)]">
              {values.length === 0 ? 'Non défini' : `${values.length} entrée${values.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Time tags */}
        <div className="flex-1 flex flex-wrap gap-2 content-start mb-3" role="list">
          {values.length === 0 && (
            <span className="text-[var(--text-muted)] text-sm font-medium px-3 py-1.5 rounded-lg bg-[var(--bg-main)]/30">
              --:--
            </span>
          )}
          {values.map((val, i) => (
            <button
              key={i}
              onClick={() => handleRemove(val)}
              className={`group px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                isBedtime
                  ? 'bg-[var(--icon-sleep)]/15 text-[var(--icon-sleep)] hover:bg-red-500/20 hover:text-red-400'
                  : 'bg-[var(--icon-wake)]/15 text-[var(--icon-wake)] hover:bg-red-500/20 hover:text-red-400'
              }`}
              aria-label={`Supprimer ${val}`}
              role="listitem"
            >
              {val}
              <Icons.X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex gap-2 items-center bg-input rounded-xl p-2">
          <input
            type="time"
            value={time}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-sm font-bold text-[var(--text-main)] focus:outline-none flex-1 min-w-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
            aria-label={`Ajouter une heure pour ${label}`}
          />
          <button
            onClick={handleAdd}
            disabled={!time}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isBedtime
                ? 'bg-[var(--icon-sleep)]/20 text-[var(--icon-sleep)] hover:bg-[var(--icon-sleep)]/30'
                : 'bg-[var(--icon-wake)]/20 text-[var(--icon-wake)] hover:bg-[var(--icon-wake)]/30'
            }`}
            aria-label="Ajouter"
          >
            <Icons.Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default MultiTimeInput;
