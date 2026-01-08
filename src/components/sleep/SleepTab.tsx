import { memo, useMemo } from 'react';
import { useJournalStore, useSettingsStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { GlowCard, Icons, ICON_MAP } from '@/components/ui';
import { ICON_ANIM_MAP } from '@/utils/constants';
import { MultiTimeInput } from './MultiTimeInput';
import { ConsumableRow } from './ConsumableRow';
import { Timeline } from './Timeline';
import type { ConsumableEntry } from '@/types';

/**
 * Sleep tracking tab component
 */
const SleepTab = memo(function SleepTab() {
  const { currentEntry, updateEntry, addConsumable, removeConsumable } = useJournalStore();
  const { settings } = useSettingsStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Get active consumables
  const activeConsumables = useMemo(
    () => settings.consumables.filter((c) => c.active),
    [settings.consumables]
  );

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
      {/* Sleep cycles card */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] transition-all duration-300 card-animated stagger-delay-1">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-[var(--primary)]"
            aria-hidden="true"
          />
          {t('cycles_title')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MultiTimeInput
            label={t('bedtime')}
            icon={Icons.Moon}
            values={currentEntry.bedtime}
            onChange={(v) => updateEntry('bedtime', v)}
            color="icon-sleep"
            iconClass="sleep-icon-moon"
          />
          <MultiTimeInput
            label={t('wakeup')}
            icon={Icons.Sun}
            values={currentEntry.wakeup}
            onChange={(v) => updateEntry('wakeup', v)}
            color="icon-wake"
            iconClass="sleep-icon-sun"
          />
        </div>
      </GlowCard>

      {/* Consumables card */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] transition-all duration-300 card-animated stagger-delay-2">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          {t('consumption_title')}
        </h3>
        <div className="space-y-2">
          {activeConsumables.map((conf, idx) => {
            const IconComponent = ICON_MAP[conf.icon] || Icons.Leaf;
            const items = (currentEntry[conf.key as keyof typeof currentEntry] ||
              []) as ConsumableEntry[];

            return (
              <div key={conf.key} className={`card-animated stagger-delay-${idx + 3}`}>
                <ConsumableRow
                  label={conf.label}
                  icon={IconComponent}
                  iconClass={ICON_ANIM_MAP[conf.icon] || 'consumable-icon'}
                  items={items}
                  onAdd={(t) => addConsumable(conf.key, t)}
                  onRemove={(i) => removeConsumable(conf.key, i)}
                  consumableKey={conf.key}
                />
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* 24h Timeline card */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-4 shadow-[var(--shadow-md)] overflow-hidden card-animated stagger-delay-4">
        <Timeline
          sleepHours={currentEntry.sleepHours}
          onChange={(hours) => updateEntry('sleepHours', hours)}
          title={t('timeline_title')}
        />
      </GlowCard>
    </div>
  );
});

export default SleepTab;
