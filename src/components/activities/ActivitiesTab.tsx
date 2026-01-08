import { memo, useState, useEffect, useRef } from 'react';
import { useJournalStore, useSettingsStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { GlowCard, AnimatedNumber, ColorSlider, Icons } from '@/components/ui';
import { getMoodBgClass } from '@/utils/helpers';

/**
 * Get gradient color based on score value
 */
function getScoreGradient(value: number): string {
  if (value <= 3) return 'from-rose-500 to-rose-400';
  if (value <= 6) return 'from-amber-500 to-amber-400';
  return 'from-emerald-500 to-emerald-400';
}

/**
 * Mini progress bar for collapsed view
 */
function MiniBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-[var(--text-muted)] w-3">{label}</span>
      <div className="w-12 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(value)} transition-all duration-300`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Activities tracking tab component
 */
const ActivitiesTab = memo(function ActivitiesTab() {
  const { currentEntry, updateEntry, addActivity, updateActivity, removeActivity } =
    useJournalStore();
  const { settings } = useSettingsStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Only ONE activity can be expanded at a time (by id), null means none
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);

  // Track activity count to detect when a new one is added
  const prevActivityCount = useRef<number>(0);

  // When a new activity is added, expand it (and collapse others)
  useEffect(() => {
    if (!currentEntry) return;

    const allActivities = currentEntry.activityLog.flatMap(slot => slot.activities);
    const currentCount = allActivities.length;

    // New activity was added
    if (currentCount > prevActivityCount.current && allActivities.length > 0) {
      // Find the newest activity (highest id)
      const newestActivity = allActivities.reduce((newest, act) =>
        act.id > newest.id ? act : newest
      , allActivities[0]);
      setExpandedActivityId(newestActivity.id);
    }

    prevActivityCount.current = currentCount;
  }, [currentEntry]);

  const toggleActivity = (activityId: number) => {
    setExpandedActivityId(prev => prev === activityId ? null : activityId);
  };

  if (!currentEntry) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <Icons.Loading className="w-8 h-8 mx-auto mb-2" />
        {t('loading')}
      </div>
    );
  }

  const moodValue = parseInt(String(currentEntry.generalMood) || '0', 10);

  return (
    <div className="space-y-5">
      {/* Mood card */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-1 relative overflow-hidden">
        {/* Background glow based on mood */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-700 ${
            !currentEntry.generalMood
              ? 'bg-[var(--text-muted)]/5'
              : moodValue <= 3
                ? 'bg-rose-500/15'
                : moodValue <= 6
                  ? 'bg-amber-400/15'
                  : 'bg-emerald-400/15'
          }`}
          aria-hidden="true"
        />

        <div className="flex items-center gap-4 relative z-10">
          {/* Mood indicator */}
          <div
            className={`mood-indicator w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg cursor-pointer ${getMoodBgClass(currentEntry.generalMood)}`}
            aria-label={`Humeur: ${moodValue}/10`}
          >
            <AnimatedNumber
              value={currentEntry.generalMood || '?'}
              className="text-2xl"
            />
          </div>

          {/* Slider and label */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[var(--text-main)]">
                {t('mood_title')}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
                  !currentEntry.generalMood
                    ? 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]'
                    : moodValue <= 3
                      ? 'bg-rose-500/15 text-rose-400'
                      : moodValue <= 6
                        ? 'bg-amber-400/15 text-amber-400'
                        : 'bg-emerald-400/15 text-emerald-400'
                }`}
              >
                {currentEntry.generalMood || 0}/10
              </span>
            </div>

            <div className="relative h-2.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                  !currentEntry.generalMood
                    ? 'bg-[var(--text-muted)]/20'
                    : moodValue <= 3
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                      : moodValue <= 6
                        ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                }`}
                style={{ width: `${(moodValue || 0) * 10}%` }}
              />
              <input
                type="range"
                min="0"
                max="10"
                value={moodValue || 0}
                onChange={(e) => updateEntry('generalMood', e.target.value)}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                aria-label={`${t('mood_title')}: ${moodValue} sur 10`}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={moodValue}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md transition-all duration-300 pointer-events-none ${
                  !currentEntry.generalMood
                    ? 'bg-[var(--text-muted)]'
                    : moodValue <= 3
                      ? 'bg-rose-400'
                      : moodValue <= 6
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                }`}
                style={{ left: `calc(${(moodValue || 0) * 10}% - 8px)` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Daily note */}
        <div className="mt-4 pt-4 relative z-10">
          <textarea
            placeholder={t('daily_note_placeholder')}
            value={currentEntry.dailyNote || ''}
            onChange={(e) => updateEntry('dailyNote', e.target.value)}
            className="w-full bg-input text-sm text-[var(--text-main)] rounded-xl px-4 py-3 resize-none transition-all duration-200 placeholder:text-[var(--text-muted)]"
            rows={2}
            aria-label={t('daily_note')}
          />
        </div>
      </GlowCard>

      {/* Activity slots */}
      {currentEntry.activityLog.map((slotLog, slotIndex) => (
        <GlowCard
          key={slotLog.slot}
          className={`bg-[var(--bg-card)] rounded-2xl p-4 shadow-[var(--shadow-md)] card-animated stagger-delay-${Math.min(slotIndex + 2, 12)}`}
        >
          <div className="flex justify-between items-center mb-3 pb-3">
            <span className="text-xs font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg">
              {slotLog.slot}
            </span>
            <button
              onClick={() => addActivity(slotIndex)}
              className="btn-interactive text-xs text-[var(--primary)] hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg font-semibold transition-all"
              aria-label={`${t('add_btn')} pour ${slotLog.slot}`}
            >
              {t('add_btn')}
            </button>
          </div>

          {slotLog.activities.length === 0 && (
            <div className="text-center py-4 text-[var(--text-muted)] text-sm">
              Aucune activité
            </div>
          )}

          {slotLog.activities.map((activity, actIdx) => {
            const isExpanded = expandedActivityId === activity.id;

            return (
              <div
                key={activity.id}
                className={`bg-[var(--bg-main)]/30 rounded-xl relative mb-3 last:mb-0 overflow-hidden animate-pop-in stagger-delay-${actIdx + 1}`}
              >
                {/* Header - always visible */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--bg-main)]/20 transition-colors"
                  onClick={() => toggleActivity(activity.id)}
                >
                  {/* Activity name or input */}
                  <div className="flex-1 min-w-0">
                    {isExpanded ? (
                      <input
                        type="text"
                        placeholder={t('activity_placeholder')}
                        value={activity.name}
                        onChange={(e) => updateActivity(slotIndex, activity.id, 'name', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-input rounded-lg px-3 py-2 text-sm font-bold text-[var(--text-main)] w-full transition-colors placeholder:text-[var(--text-muted)]"
                        aria-label="Nom de l'activité"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--text-main)] truncate">
                          {activity.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <MiniBar value={activity.plaisir} label="P" />
                          <MiniBar value={activity.maitrise} label="M" />
                          <MiniBar value={activity.satisfaction} label="S" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <Icons.ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeActivity(slotIndex, activity.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                      aria-label={`Supprimer l'activité ${activity.name || 'sans nom'}`}
                    >
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sliders - collapsible */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-3 pb-3 pt-1 space-y-3">
                      <ColorSlider
                        label={t('pleasure')}
                        value={activity.plaisir}
                        onChange={(v) => updateActivity(slotIndex, activity.id, 'plaisir', v)}
                      />
                      <ColorSlider
                        label={t('mastery')}
                        value={activity.maitrise}
                        onChange={(v) => updateActivity(slotIndex, activity.id, 'maitrise', v)}
                      />
                      <ColorSlider
                        label={t('satisfaction')}
                        value={activity.satisfaction}
                        onChange={(v) => updateActivity(slotIndex, activity.id, 'satisfaction', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </GlowCard>
      ))}
    </div>
  );
});

export default ActivitiesTab;
