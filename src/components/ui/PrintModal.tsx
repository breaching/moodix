import { useJournalStore, useSettingsStore, useUIStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { Icons } from './Icons';

export function PrintModal() {
  const { entries } = useJournalStore();
  const { settings } = useSettingsStore();
  const {
    isPrintModalOpen,
    closePrintModal,
    printSelectedDates,
    printConfig,
    togglePrintDate,
    setPrintSelectedDates,
    togglePrintConfig,
  } = useUIStore();

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  const handlePrint = () => {
    closePrintModal();
    setTimeout(() => window.print(), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePrintModal();
    }
  };

  if (!isPrintModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 modal-backdrop no-print"
      onClick={handleBackdropClick}
    >
      <div className="glass-modal w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] modal-content border border-[var(--glass-border)]" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
        {/* Header avec gradient subtil */}
        <div className="relative p-5 bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-main)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent pointer-events-none"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                <Icons.Printer className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('print_config')}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {printSelectedDates.length}{' '}
                  {settings.lang === 'fr' ? 'jour(s) sélectionné(s)' : 'day(s) selected'}
                </p>
              </div>
            </div>
            <button
              onClick={closePrintModal}
              className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-all hover:rotate-90"
            >
              <Icons.X />
            </button>
          </div>
        </div>

        {/* Section des types de contenu */}
        <div className="p-4 bg-[var(--bg-main)]/30">
          <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
            </svg>
            {t('print_sections')}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {/* Sommeil */}
            <button
              onClick={() => togglePrintConfig('sleep')}
              className={`relative py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${
                printConfig.sleep
                  ? 'bg-[var(--primary)]/20 text-[var(--primary-light)] shadow-lg shadow-[var(--primary)]/20 ring-2 ring-[var(--primary)]/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  printConfig.sleep ? 'bg-[var(--primary)]/30' : 'bg-[var(--bg-elevated)]'
                }`}
              >
                <Icons.Moon />
              </div>
              <span>{t('print_sleep')}</span>
              {printConfig.sleep && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg animate-pop-in">
                  <Icons.Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Activités */}
            <button
              onClick={() => togglePrintConfig('activities')}
              className={`relative py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${
                printConfig.activities
                  ? 'bg-[var(--accent)]/20 text-[var(--accent-light)] shadow-lg shadow-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  printConfig.activities ? 'bg-[var(--accent)]/30' : 'bg-[var(--bg-elevated)]'
                }`}
              >
                <Icons.List />
              </div>
              <span>{t('print_act')}</span>
              {printConfig.activities && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg animate-pop-in">
                  <Icons.Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Cycles */}
            <button
              onClick={() => togglePrintConfig('cycles')}
              className={`relative py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${
                printConfig.cycles
                  ? 'bg-[var(--icon-wake)]/20 text-[var(--icon-wake)] shadow-lg shadow-[var(--icon-wake)]/20 ring-2 ring-[var(--icon-wake)]/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  printConfig.cycles ? 'bg-[var(--icon-wake)]/30' : 'bg-[var(--bg-elevated)]'
                }`}
              >
                <Icons.Refresh />
              </div>
              <span>{t('print_cycles')}</span>
              {printConfig.cycles && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--icon-wake)] flex items-center justify-center shadow-lg animate-pop-in">
                  <Icons.Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Liste des dates avec scroll stylisé */}
        <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-[var(--bg-card)]/50 flex items-center justify-between flex-shrink-0">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              {settings.lang === 'fr' ? 'Sélectionner les dates' : 'Select dates'}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setPrintSelectedDates(Object.keys(entries))}
                className="text-xs text-[var(--primary)] font-bold px-3 py-1.5 rounded-lg hover:bg-[var(--primary)]/10 transition-colors"
              >
                {t('select_all')}
              </button>
              {printSelectedDates.length > 0 && (
                <button
                  onClick={() => setPrintSelectedDates([])}
                  className="text-xs text-[var(--text-muted)] font-bold px-3 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  {settings.lang === 'fr' ? 'Désélectionner' : 'Clear'}
                </button>
              )}
            </div>
          </div>
          <div className="p-3 overflow-y-auto flex-1 space-y-2">
            {Object.keys(entries)
              .sort()
              .reverse()
              .map((date, idx) => {
                const isSelected = printSelectedDates.includes(date);
                const entry = entries[date];
                const hasSleep = entry.sleepHours?.filter(Boolean).length > 0;
                const hasActivities = entry.activityLog?.some((s) => s.activities?.length > 0);
                const hasCycles = entry.viciousCycles?.length > 0;

                return (
                  <div
                    key={date}
                    onClick={() => togglePrintDate(date)}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[var(--primary)]/10 shadow-md shadow-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                        : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Checkbox animée */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected
                          ? 'bg-[var(--primary)] scale-110 shadow-lg shadow-[var(--primary)]/30'
                          : 'bg-[var(--bg-elevated)] group-hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white animate-pop-in"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>

                    {/* Contenu de la date */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--text-main)] truncate">
                        {new Date(date).toLocaleDateString(
                          settings.lang === 'fr' ? 'fr-FR' : 'en-US',
                          { weekday: 'long', day: 'numeric', month: 'long' }
                        )}
                      </div>
                      {/* Indicateurs de contenu */}
                      <div className="flex gap-1.5 mt-1">
                        {hasSleep && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary-light)]">
                            <Icons.Moon className="w-3 h-3" />
                          </span>
                        )}
                        {hasActivities && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent-light)]">
                            <Icons.List className="w-3 h-3" />
                          </span>
                        )}
                        {hasCycles && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--icon-wake)]/20 text-[var(--icon-wake)]">
                            <Icons.Refresh className="w-3 h-3" />
                          </span>
                        )}
                        {!hasSleep && !hasActivities && !hasCycles && (
                          <span className="text-[10px] text-[var(--text-muted)] italic">
                            {settings.lang === 'fr' ? 'Vide' : 'Empty'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Indicateur de sélection */}
                    <div
                      className={`w-2 h-8 rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-[var(--primary)]' : 'bg-transparent'
                      }`}
                    ></div>
                  </div>
                );
              })}

            {Object.keys(entries).length === 0 && (
              <div className="empty-state text-center py-8 text-[var(--text-muted)]">
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <p className="text-sm">
                  {settings.lang === 'fr' ? 'Aucune entrée disponible' : 'No entries available'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer avec bouton d'impression */}
        <div className="p-3 bg-[var(--bg-card)] flex-shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
          <button
            onClick={handlePrint}
            disabled={printSelectedDates.length === 0}
            className={`btn-interactive ripple-container w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
              printSelectedDates.length > 0
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/30'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            <Icons.Printer />
            <span>{t('print_btn')}</span>
            {printSelectedDates.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {printSelectedDates.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
