import { useJournalStore, useSettingsStore, useUIStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { DISPLAY_HOURS } from '@/utils/constants';
import { isTimeInColumn } from '@/utils/helpers';

/**
 * Print-only view that renders the exact format required by the therapist
 * This component is hidden on screen but visible when printing
 */
export function PrintView() {
  const { entries } = useJournalStore();
  const { settings } = useSettingsStore();
  const { printConfig, printSelectedDates } = useUIStore();

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  return (
    <div className="print-only p-4 print-reset-bg">
      {/* Sleep Agenda Table */}
      {printConfig.sleep && (
        <>
          <h1 className="text-2xl font-bold text-center mb-1 print-reset-text">
            {t('print_title_sleep')}
          </h1>
          <div className="flex justify-center gap-5 mb-3 text-[10px] uppercase font-bold text-[var(--text-muted)] print-reset-text border-b pb-2 mx-auto w-3/4">
            <span>A = {settings.consumables.find((c) => c.key === 'cannabis')?.label}</span>
            <span>C = {settings.consumables.find((c) => c.key === 'caffeine')?.label}</span>
            <span>M = {settings.consumables.find((c) => c.key === 'medication')?.label}</span>
            <span>E = {settings.consumables.find((c) => c.key === 'exercise')?.label}</span>
          </div>
          <table className="w-full border-collapse print-grid mb-8">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Date</th>
                {DISPLAY_HOURS.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(entries)
                .sort()
                .map((date) => {
                  const entry = entries[date];
                  const dayName = new Date(date).toLocaleDateString(
                    settings.lang === 'fr' ? 'fr-FR' : 'en-US',
                    { weekday: 'long' }
                  );
                  return (
                    <tr key={date}>
                      <td className="text-left pl-1 relative">
                        <div className="font-bold">
                          {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                        </div>
                        <div className="text-[9px] uppercase">{dayName.slice(0, 3)}</div>
                      </td>
                      {(entry.sleepHours || []).map((isAsleep, idx) => {
                        const bedtimes = Array.isArray(entry.bedtime)
                          ? entry.bedtime
                          : entry.bedtime
                            ? [entry.bedtime]
                            : [];
                        const wakeups = Array.isArray(entry.wakeup)
                          ? entry.wakeup
                          : entry.wakeup
                            ? [entry.wakeup]
                            : [];

                        const isBedtime = bedtimes.some((t) => isTimeInColumn(t, idx));
                        const isWakeup = wakeups.some((t) => isTimeInColumn(t, idx));

                        const caffeineCount = (entry.caffeine || []).filter((c) => {
                          const time = typeof c === 'string' ? null : c.time;
                          return time && isTimeInColumn(time, idx);
                        }).length;
                        const exCount = (entry.exercise || []).filter((e) => {
                          const time = typeof e === 'string' ? null : e.time;
                          return time && isTimeInColumn(time, idx);
                        }).length;
                        const medCount = (entry.medication || []).filter((m) => {
                          const time = typeof m === 'string' ? null : m.time;
                          return time && isTimeInColumn(time, idx);
                        }).length;
                        const cannabisCount = (entry.cannabis || []).filter((a) => {
                          const time = typeof a === 'string' ? null : a.time;
                          return time && isTimeInColumn(time, idx);
                        }).length;

                        return (
                          <td key={idx} className={isAsleep ? 'cell-sleep' : ''}>
                            <div className="cell-content">
                              {isBedtime && <span className="arrow-symbol">↓</span>}{' '}
                              {isWakeup && <span className="arrow-symbol">↑</span>}
                              {caffeineCount > 0 && <span className="letter-symbol">C</span>}{' '}
                              {medCount > 0 && <span className="letter-symbol">M</span>}
                              {exCount > 0 && <span className="letter-symbol">E</span>}{' '}
                              {cannabisCount > 0 && (
                                <span className="letter-symbol">
                                  {cannabisCount > 1 ? `A${cannabisCount}` : 'A'}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </>
      )}

      {/* Activities and Cycles for selected dates */}
      {[...printSelectedDates].sort().map((date) => {
        const entry = entries[date];
        if (!entry) return null;

        const logData = entry.activityLog || [];
        const hasActivities =
          printConfig.activities && logData.some((l) => l.activities && l.activities.length > 0);
        const hasCycles =
          printConfig.cycles && entry.viciousCycles && entry.viciousCycles.length > 0;

        if (!hasActivities && !hasCycles) return null;

        return (
          <div key={date} className="page-break print-reset-text">
            <h1 className="text-xl font-bold text-center mt-4 mb-2">
              {t('print_title_act')} -{' '}
              {new Date(date).toLocaleDateString(settings.lang === 'fr' ? 'fr-FR' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h1>

            {hasActivities && (
              <>
                <table className="activity-print-table">
                  <thead>
                    <tr>
                      <th className="w-16">Heure</th>
                      <th>{t('print_act')}</th>
                      <th className="w-12">P</th>
                      <th className="w-12">M</th>
                      <th className="w-12">S</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.map((log) => (
                      <tr key={log.slot}>
                        <td className="text-center font-bold">{log.slot}</td>
                        <td>
                          <strong>
                            {log.activities.map((act) => act.name).join(' - ')}
                          </strong>
                        </td>
                        <td className="text-center">
                          {log.activities.map((act) => act.plaisir).join(' - ')}
                        </td>
                        <td className="text-center">
                          {log.activities.map((act) => act.maitrise).join(' - ')}
                        </td>
                        <td className="text-center">
                          {log.activities.map((act) => act.satisfaction).join(' - ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex gap-4">
                  <div className="border p-2 text-center font-bold flex-1">
                    {t('mood_title')} : {entry.generalMood}/10
                  </div>
                  {entry.thoughts && (
                    <div className="border p-2 text-sm italic flex-[3]">&quot;{entry.thoughts}&quot;</div>
                  )}
                </div>
              </>
            )}

            {hasCycles && (
              <div className={hasActivities ? 'page-break' : 'mt-6'}>
                <h2 className="text-sm font-bold uppercase mb-2 border-b">{t('cycles_header')}</h2>
                <table className="cycle-print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>{t('situation_label')}</th>
                      <th style={{ width: '15%' }}>{t('emotions_label')}</th>
                      <th style={{ width: '20%' }}>{t('thoughts_label')}</th>
                      <th style={{ width: '20%' }}>{t('behaviors_label')}</th>
                      <th style={{ width: '25%' }}>{t('consequences_label')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.viciousCycles.map((cycle) => (
                      <tr key={cycle.id}>
                        <td>{cycle.situation}</td>
                        <td>
                          {cycle.emotions.map((e, i) => (
                            <div key={i} className="cycle-list-item">
                              • {e.name} <strong>({e.score})</strong>
                            </div>
                          ))}
                        </td>
                        <td>
                          {cycle.thoughts.map((th, i) => (
                            <div key={i} className="cycle-list-item">
                              • {th.text}
                            </div>
                          ))}
                        </td>
                        <td>
                          {cycle.behaviors.map((b, i) => (
                            <div key={i} className="cycle-list-item">
                              • {b.text}
                            </div>
                          ))}
                        </td>
                        <td>
                          {cycle.consequences.map((c, i) => (
                            <div key={i} className="cycle-list-item">
                              • {c.text}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
