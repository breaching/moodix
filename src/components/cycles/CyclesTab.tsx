import { memo, useState, useEffect, useRef } from 'react';
import { useJournalStore, useSettingsStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { GlowCard, ColorSlider, Icons } from '@/components/ui';

/**
 * Mini badge showing count of items
 */
function CountBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span className="text-[10px] bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
      {count} {label}
    </span>
  );
}

/**
 * Collapsed preview of a cycle
 */
function CyclePreview({ cycle }: { cycle: { situation: string; emotions: unknown[]; thoughts: unknown[]; behaviors: unknown[]; consequences: unknown[] } }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-bold text-[var(--text-main)] truncate max-w-[200px]">
        {cycle.situation || 'Sans titre'}
      </span>
      <div className="flex items-center gap-1.5">
        <CountBadge count={cycle.emotions.length} label="É" />
        <CountBadge count={cycle.thoughts.length} label="P" />
        <CountBadge count={cycle.behaviors.length} label="C" />
        <CountBadge count={cycle.consequences.length} label="Cs" />
      </div>
    </div>
  );
}

/**
 * Vicious cycles (CBT) tracking tab component
 */
const CyclesTab = memo(function CyclesTab() {
  const {
    currentEntry,
    addCycle,
    updateCycle,
    removeCycle,
    addSubItem,
    updateSubItem,
    removeSubItem,
  } = useJournalStore();
  const { settings } = useSettingsStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Only ONE cycle can be expanded at a time (by id), null means none
  const [expandedCycleId, setExpandedCycleId] = useState<number | null>(null);

  // Track cycle count to detect when a new one is added
  const prevCycleCount = useRef<number>(0);

  // When a new cycle is added, expand it (and collapse others)
  useEffect(() => {
    if (!currentEntry) return;

    const cycles = currentEntry.viciousCycles || [];
    const currentCount = cycles.length;

    // New cycle was added
    if (currentCount > prevCycleCount.current && cycles.length > 0) {
      // Find the newest cycle (highest id)
      const newestCycle = cycles.reduce((newest, c) =>
        c.id > newest.id ? c : newest
      , cycles[0]);
      setExpandedCycleId(newestCycle.id);
    }

    prevCycleCount.current = currentCount;
  }, [currentEntry]);

  const toggleCycle = (cycleId: number) => {
    setExpandedCycleId(prev => prev === cycleId ? null : cycleId);
  };

  if (!currentEntry) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <Icons.Loading className="w-8 h-8 mx-auto mb-2" />
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <Icons.Refresh className="w-4 h-4" />
            {t('cycles_header')}
          </h3>
          <button
            onClick={addCycle}
            className="btn-interactive text-xs bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 transition-all"
            aria-label={t('new_btn')}
          >
            {t('new_btn')}
          </button>
        </div>

        {(currentEntry.viciousCycles || []).length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-input flex items-center justify-center">
              <Icons.Refresh className="w-8 h-8 text-[var(--text-muted)]/50" />
            </div>
            <span>{t('no_cycles')}</span>
          </div>
        )}

        {(currentEntry.viciousCycles || []).map((cycle, cycleIndex) => {
          const isExpanded = expandedCycleId === cycle.id;

          return (
            <div
              key={cycle.id}
              className={`bg-[var(--bg-main)]/30 rounded-xl overflow-hidden mb-3 last:mb-0 shadow-[var(--shadow-sm)] transition-all duration-300 card-animated stagger-delay-${Math.min(cycleIndex + 2, 6)}`}
            >
              {/* Header - always visible, clickable to toggle */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--bg-main)]/20 transition-colors"
                onClick={() => toggleCycle(cycle.id)}
              >
                <div className="flex-1 min-w-0">
                  {isExpanded ? (
                    <div className="flex items-center gap-2">
                      <Icons.Refresh className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-xs font-bold text-[var(--primary)] uppercase">
                        {t('situation_label')}
                      </span>
                    </div>
                  ) : (
                    <CyclePreview cycle={cycle} />
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
                      removeCycle(cycle.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                    aria-label="Supprimer ce cycle"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content - collapsible */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  {/* Situation input */}
                  <div className="px-3 pb-3">
                    <input
                      id={`situation-${cycle.id}`}
                      type="text"
                      value={cycle.situation}
                      onChange={(e) => updateCycle(cycle.id, 'situation', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-input rounded-lg px-3 py-2 text-base font-bold text-[var(--text-main)] placeholder-[var(--text-muted)]"
                      placeholder={t('situation_ph')}
                    />
                  </div>

                  <div className="space-y-px">
                    {/* Emotions section */}
                    <div className="bg-[var(--bg-card)]/30 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">
                          {t('emotions_label')}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addSubItem(cycle.id, 'emotions', { name: '', score: 5 });
                          }}
                          className="text-[var(--primary)] hover:scale-110 transition-transform"
                          aria-label={t('add_emotion')}
                        >
                          <Icons.Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cycle.emotions.map((emo) => (
                          <div
                            key={emo.id}
                            className="bg-[var(--bg-main)]/40 p-3 rounded-lg relative"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubItem(cycle.id, 'emotions', emo.id);
                              }}
                              className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-rose-400 transition-all"
                              aria-label="Supprimer cette émotion"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={emo.name}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateSubItem(cycle.id, 'emotions', emo.id, 'name', e.target.value)
                              }
                              className="bg-input rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--text-main)] w-full pr-8 mb-2 placeholder:text-[var(--text-muted)]"
                              placeholder={t('emotions_ph')}
                            />
                            <ColorSlider
                              label={t('intensity')}
                              value={emo.score}
                              onChange={(v) =>
                                updateSubItem(cycle.id, 'emotions', emo.id, 'score', v)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Thoughts section */}
                    <div className="bg-[var(--bg-card)]/30 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">
                          {t('thoughts_label')}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addSubItem(cycle.id, 'thoughts', { text: '' });
                          }}
                          className="text-[var(--primary)] hover:scale-110 transition-transform"
                          aria-label={t('add_thought')}
                        >
                          <Icons.Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cycle.thoughts.map((thought) => (
                          <div key={thought.id} className="flex items-start gap-2">
                            <textarea
                              value={thought.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateSubItem(cycle.id, 'thoughts', thought.id, 'text', e.target.value)
                              }
                              className="flex-1 bg-input text-xs text-[var(--text-main)] rounded-lg px-3 py-2 resize-none min-h-[40px] placeholder:text-[var(--text-muted)]"
                              placeholder={t('placeholder_txt')}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubItem(cycle.id, 'thoughts', thought.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-rose-400 transition-all mt-2"
                              aria-label="Supprimer cette pensée"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Behaviors section */}
                    <div className="bg-[var(--bg-card)]/30 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">
                          {t('behaviors_label')}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addSubItem(cycle.id, 'behaviors', { text: '' });
                          }}
                          className="text-[var(--primary)] hover:scale-110 transition-transform"
                          aria-label={t('add_behavior')}
                        >
                          <Icons.Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cycle.behaviors.map((beh) => (
                          <div key={beh.id} className="flex items-start gap-2">
                            <textarea
                              value={beh.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateSubItem(cycle.id, 'behaviors', beh.id, 'text', e.target.value)
                              }
                              className="flex-1 bg-input text-xs text-[var(--text-main)] rounded-lg px-3 py-2 resize-none min-h-[40px] placeholder:text-[var(--text-muted)]"
                              placeholder={t('placeholder_txt')}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubItem(cycle.id, 'behaviors', beh.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-rose-400 transition-all mt-2"
                              aria-label="Supprimer ce comportement"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consequences section */}
                    <div className="bg-[var(--bg-card)]/30 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">
                          {t('consequences_label')}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addSubItem(cycle.id, 'consequences', { text: '' });
                          }}
                          className="text-[var(--primary)] hover:scale-110 transition-transform"
                          aria-label={t('add_consequence')}
                        >
                          <Icons.Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cycle.consequences.map((csq) => (
                          <div key={csq.id} className="flex items-start gap-2">
                            <textarea
                              value={csq.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateSubItem(cycle.id, 'consequences', csq.id, 'text', e.target.value)
                              }
                              className="flex-1 bg-input text-xs text-[var(--text-main)] rounded-lg px-3 py-2 resize-none min-h-[40px] placeholder:text-[var(--text-muted)]"
                              placeholder={t('placeholder_txt')}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubItem(cycle.id, 'consequences', csq.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-rose-400 transition-all mt-2"
                              aria-label="Supprimer cette conséquence"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </GlowCard>
    </div>
  );
});

export default CyclesTab;
