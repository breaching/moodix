import { useState, memo, type ChangeEvent, type KeyboardEvent } from 'react';
import type { ConsumableRowProps } from '@/types';
import { Icons } from '@/components/ui';
import { getConsumableColor, getConsumableBg } from '@/utils/helpers';

/**
 * Row component for tracking consumables with time entries
 */
export const ConsumableRow = memo(function ConsumableRow({
  label,
  icon: Icon,
  items,
  onAdd,
  onRemove,
  consumableKey,
  iconClass = 'consumable-icon',
}: ConsumableRowProps) {
  const [time, setTime] = useState('');

  // Get color values from consumable key
  const colorValue = getConsumableColor(consumableKey);
  const bgValue = getConsumableBg(consumableKey);

  const handleAdd = () => {
    if (time) {
      onAdd(time);
      setTime('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl consumable-row border border-[var(--border)]"
      style={{ background: 'var(--bg-card)' }}
      role="group"
      aria-label={label}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundColor: bgValue }} />

      {/* Content */}
      <div className="relative p-3 rounded-xl backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon and label */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgValue }}>
              <span className={iconClass} style={{ color: colorValue }} aria-hidden="true">
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-xs font-bold" style={{ color: colorValue }}>{label}</span>
              <div className="text-[10px] text-[var(--text-muted)]">
                {items.length === 0 ? 'Non défini' : `${items.length} entrée${items.length > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          {/* Right: Input area */}
          <div className="flex gap-1.5 items-center bg-input rounded-lg p-1.5">
            <input
              type="time"
              value={time}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-[4.5rem] text-xs font-medium text-[var(--text-main)] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
              aria-label={`Ajouter une heure pour ${label}`}
            />
            <button
              onClick={handleAdd}
              disabled={!time}
              className="p-1 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
              style={{ backgroundColor: bgValue, color: colorValue }}
              aria-label="Ajouter"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Time tags */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5" role="list">
            {items.map((item, i) => {
              const displayText = typeof item === 'object' && 'time' in item ? item.time : '';
              return (
                <button
                  key={i}
                  onClick={() => onRemove(i)}
                  className="group px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer consumable-tag flex items-center gap-1 hover:bg-red-500/20 hover:text-red-400 transition-all"
                  style={{ backgroundColor: bgValue, color: colorValue }}
                  aria-label={`Supprimer ${displayText}`}
                  role="listitem"
                >
                  {displayText}
                  <Icons.X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default ConsumableRow;
