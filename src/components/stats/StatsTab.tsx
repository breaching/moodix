import { memo, useMemo } from 'react';
import { useJournalStore, useSettingsStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { GlowCard, AnimatedNumber, Icons } from '@/components/ui';

/**
 * Statistics and analysis tab component
 */
const StatsTab = memo(function StatsTab() {
  const { entries, currentEntry, updateEntry } = useJournalStore();
  const { settings } = useSettingsStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const entriesArray = Object.values(entries);
    const last7Days = entriesArray.slice(-7);

    // Average mood
    const moodsWithValue = last7Days.filter(
      (e) => e.generalMood && parseInt(String(e.generalMood), 10) > 0
    );
    const avgMood =
      moodsWithValue.reduce((sum, e) => sum + parseFloat(String(e.generalMood)), 0) /
      (moodsWithValue.length || 1);

    // Average sleep
    let totalSleep = 0;
    let sleepCount = 0;
    last7Days.forEach((e) => {
      if (e.sleepHours && e.sleepHours.length > 0) {
        const hours = e.sleepHours.filter(Boolean).length;
        if (hours > 0) {
          totalSleep += hours;
          sleepCount++;
        }
      }
    });
    const avgSleep = sleepCount > 0 ? totalSleep / sleepCount : 0;

    // Total activities
    const totalActivities = last7Days.reduce((sum, e) => {
      if (!e.activityLog) return sum;
      return sum + e.activityLog.reduce((s, slot) => s + (slot.activities?.length || 0), 0);
    }, 0);

    // Completed days
    const completedDays = last7Days.filter(
      (e) =>
        e.generalMood ||
        (e.sleepHours && e.sleepHours.filter(Boolean).length > 0) ||
        (e.activityLog && e.activityLog.some((s) => s.activities?.length > 0))
    ).length;

    return { avgMood, avgSleep, totalActivities, completedDays };
  }, [entries]);

  // Calculate top activities
  const topActivities = useMemo(() => {
    const allActivities: { name: string; plaisir: number }[] = [];
    Object.values(entries).forEach((entry) => {
      if (!entry.activityLog) return;
      entry.activityLog.forEach((slot) => {
        slot.activities?.forEach((act) => {
          if (act.name) {
            allActivities.push({ name: act.name, plaisir: act.plaisir || 0 });
          }
        });
      });
    });

    // Group by name and average pleasure score
    const grouped = allActivities.reduce(
      (acc, act) => {
        if (!acc[act.name]) {
          acc[act.name] = { total: 0, count: 0 };
        }
        acc[act.name].total += act.plaisir;
        acc[act.name].count++;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return Object.entries(grouped)
      .map(([name, data]) => ({
        name,
        avgPlaisir: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avgPlaisir - a.avgPlaisir)
      .slice(0, 5);
  }, [entries]);

  if (!currentEntry) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <Icons.Loading className="w-8 h-8 mx-auto mb-2" />
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly summary stats */}
      <div className="grid grid-cols-2 gap-4" role="region" aria-label="Statistiques hebdomadaires">
        <div className="stat-card bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-dark)]/10 rounded-xl p-4 shadow-lg shadow-[var(--primary)]/10 card-animated stagger-delay-1 hover:scale-[1.02] transition-transform border border-[var(--primary)]/20 backdrop-blur-sm">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('last_week')}</div>
          <div className="text-2xl font-bold text-[var(--primary)]">
            <AnimatedNumber value={weeklyStats.avgMood.toFixed(1)} />
          </div>
          <div className="text-xs text-[var(--text-muted)]">{t('mood_trend')}</div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 shadow-lg shadow-blue-500/10 card-animated stagger-delay-2 hover:scale-[1.02] transition-transform border border-blue-500/20 backdrop-blur-sm">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('last_week')}</div>
          <div className="text-2xl font-bold text-blue-400">
            <AnimatedNumber value={weeklyStats.avgSleep.toFixed(1)} />h
          </div>
          <div className="text-xs text-[var(--text-muted)]">{t('sleep_average')}</div>
        </div>

        <div className="stat-card bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 shadow-lg shadow-emerald-500/10 card-animated stagger-delay-3 hover:scale-[1.02] transition-transform border border-emerald-500/20 backdrop-blur-sm">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('last_week')}</div>
          <div className="text-2xl font-bold text-emerald-400">
            <AnimatedNumber value={weeklyStats.totalActivities} />
          </div>
          <div className="text-xs text-[var(--text-muted)]">{t('tab_activities')}</div>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-4 shadow-lg shadow-orange-500/10 card-animated stagger-delay-4 hover:scale-[1.02] transition-transform border border-orange-500/20 backdrop-blur-sm">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('last_week')}</div>
          <div className="text-2xl font-bold text-orange-400">
            <AnimatedNumber value={weeklyStats.completedDays} />/7
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {t('days_streak').replace('{count}', '')}
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-3">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="stats-icon">
            <Icons.Chart />
          </span>
          {t('stats_sleep_mood')}
        </h3>
        <div className="h-40 flex items-center justify-center text-[var(--text-muted)] text-sm">
          {Object.keys(entries).length < 3 ? (
            t('no_data')
          ) : (
            <div className="w-full">
              {/* Simple bar visualization */}
              <div className="flex items-end justify-around h-32 gap-1">
                {Object.entries(entries)
                  .slice(-7)
                  .map(([date, entry]) => {
                    const mood = parseInt(String(entry.generalMood) || '0', 10);
                    const sleep = entry.sleepHours?.filter(Boolean).length || 0;
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-[var(--primary)]/60 rounded-t transition-all"
                          style={{ height: `${mood * 10}%` }}
                          title={`Humeur: ${mood}/10`}
                        />
                        <div
                          className="w-full bg-blue-400/60 rounded-t transition-all"
                          style={{ height: `${(sleep / 12) * 100}%` }}
                          title={`Sommeil: ${sleep}h`}
                        />
                        <span className="text-[8px] text-[var(--text-muted)]">
                          {new Date(date).getDate()}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </GlowCard>

      {/* Thoughts journal */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-4">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="stats-icon">
            <Icons.Brain />
          </span>
          {t('stats_thoughts')}
        </h3>
        <textarea
          placeholder={t('stats_thoughts_ph')}
          value={currentEntry.thoughts}
          onChange={(e) => updateEntry('thoughts', e.target.value)}
          className="w-full h-32 bg-input rounded-xl p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none resize-none transition-colors"
          aria-label={t('stats_thoughts')}
        />
      </GlowCard>

      {/* Top activities */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-5">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="stats-icon">
            <Icons.List />
          </span>
          {t('stats_top_act')}
        </h3>
        {topActivities.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-sm py-4">{t('no_data')}</div>
        ) : (
          <div className="space-y-2">
            {topActivities.map((act, idx) => (
              <div
                key={act.name}
                className="flex items-center gap-3 p-2 rounded-lg bg-input"
              >
                <span className="text-lg font-bold text-[var(--primary)] w-6">{idx + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--text-main)]">{act.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{act.count} fois</div>
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  {act.avgPlaisir.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
});

export default StatsTab;
