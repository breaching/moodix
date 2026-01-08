import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useAuthStore, useSettingsStore, useJournalStore, useUIStore } from '@/stores';
import { LoginForm } from '@/components/auth';
import { Toast, Icons, NavBtn, PrintModal } from '@/components/ui';
import { PrintView } from '@/components/print';
import { getTranslation } from '@/utils/translations';
import { useTabTransition } from '@/hooks';

// Lazy load tab content for better performance
const SleepTab = lazy(() => import('@/components/sleep/SleepTab'));
const ActivitiesTab = lazy(() => import('@/components/activities/ActivitiesTab'));
const CyclesTab = lazy(() => import('@/components/cycles/CyclesTab'));
const StatsTab = lazy(() => import('@/components/stats/StatsTab'));
const SettingsTab = lazy(() => import('@/components/settings/SettingsTab'));

// Loading fallback
const TabLoading = () => (
  <div className="flex items-center justify-center py-12">
    <Icons.Loading className="w-8 h-8" />
  </div>
);

function App() {
  // Auth state
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Transition state for smooth login animation
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  // Settings state
  const { settings, loadSettings } = useSettingsStore();

  // Journal state
  const { selectedDate, currentEntry, entries, loadEntries, changeDate, setSelectedDate, saveCurrentEntry, saveStatus } = useJournalStore();

  // UI state
  const { activeTab, setActiveTab, toast, openPrintModal, isPrintModalOpen, togglePrintDate, printSelectedDates } = useUIStore();

  // Auto-save ref for debouncing
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabTransitionClass = useTabTransition(activeTab);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Check auth on mount
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Load settings and entries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void loadSettings();
      void loadEntries();
    }
  }, [isAuthenticated, loadSettings, loadEntries]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-color', settings.colorScheme);
  }, [settings.theme, settings.colorScheme]);

  // Auto-save logic
  useEffect(() => {
    if (!currentEntry) return;

    const savedEntry = entries[currentEntry.date];

    // Compare currentEntry with the last saved version
    const isDifferent = JSON.stringify(currentEntry) !== JSON.stringify(savedEntry);

    if (!isDifferent) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation for 1500ms
    saveTimeoutRef.current = setTimeout(() => {
      void saveCurrentEntry();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentEntry, entries, saveCurrentEntry]);

  // Auto-select current date for print
  useEffect(() => {
    if (selectedDate && !printSelectedDates.includes(selectedDate)) {
      togglePrintDate(selectedDate);
    }
  }, [selectedDate, printSelectedDates, togglePrintDate]);

  // Handle login success - trigger app fade in
  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    // Small delay before showing app for smooth transition
    setTimeout(() => {
      setAppVisible(true);
    }, 100);
  };

  // When already authenticated on mount, skip login form
  useEffect(() => {
    if (isAuthenticated === true && showLoginForm) {
      setShowLoginForm(false);
      setAppVisible(true);
    }
  }, [isAuthenticated, showLoginForm]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--primary)]">
        <Icons.Loading className="w-8 h-8 mr-2" />
        Vérification...
      </div>
    );
  }

  // Not authenticated - show login form
  if (isAuthenticated === false || showLoginForm) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen pb-32 font-outfit text-[var(--text-main)] relative transition-opacity duration-500 ${appVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-main)]/95 backdrop-blur-xl no-print shadow-lg shadow-black/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="nav-arrow-btn p-2.5 rounded-xl bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] flex-shrink-0 transition-all hover:text-[var(--primary)]"
            aria-label="Jour précédent"
          >
            <Icons.ChevronLeft />
          </button>

          <div className="flex-1 text-center relative group cursor-pointer mx-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              aria-label="Sélectionner une date"
            />
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <h1 className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest">
                {t('title')}
              </h1>
              {/* Save status indicator */}
              {saveStatus === 'saving' && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title={t('status_saving')} />
              )}
              {saveStatus === 'saved' && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-fade-out" title="Sauvegardé" />
              )}
              {saveStatus === 'error' && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Erreur" />
              )}
              {saveStatus === 'offline' && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" title="Hors ligne" />
              )}
            </div>
            <div className="font-bold text-lg text-[var(--text-main)]">
              {new Date(selectedDate).toLocaleDateString(
                settings.lang === 'fr' ? 'fr-FR' : 'en-US',
                { weekday: 'long', day: 'numeric', month: 'short' }
              )}
            </div>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="nav-arrow-btn p-2.5 rounded-xl bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] flex-shrink-0 transition-all hover:text-[var(--primary)]"
            aria-label="Jour suivant"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={`max-w-md mx-auto p-4 no-print ${tabTransitionClass}`}>
        <Suspense fallback={<TabLoading />}>
          {activeTab === 'sleep' && <SleepTab />}
          {activeTab === 'activities' && <ActivitiesTab />}
          {activeTab === 'cycles' && <CyclesTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </Suspense>
      </main>

      {/* Footer navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 nav-bar backdrop-blur-xl pb-safe px-4 py-3 z-50 no-print flex justify-between items-center border-t border-[var(--glass-border)]"
        style={{ background: 'var(--glass-bg)' }}
        aria-label="Navigation principale"
      >
        <div className="flex gap-1 bg-[var(--bg-card)]/60 backdrop-blur p-1.5 rounded-2xl overflow-x-auto w-full mr-3 shadow-lg shadow-black/10 border border-[var(--border)]">
          <NavBtn
            label={t('tab_sleep')}
            icon={Icons.Moon}
            active={activeTab === 'sleep'}
            onClick={() => setActiveTab('sleep')}
          />
          <NavBtn
            label={t('tab_activities')}
            icon={Icons.List}
            active={activeTab === 'activities'}
            onClick={() => setActiveTab('activities')}
          />
          <NavBtn
            label={t('tab_cycles')}
            icon={Icons.Refresh}
            active={activeTab === 'cycles'}
            onClick={() => setActiveTab('cycles')}
          />
          <NavBtn
            label={t('tab_stats')}
            icon={Icons.Chart}
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
          />
          <NavBtn
            label={t('tab_settings')}
            icon={Icons.Cog}
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={openPrintModal}
            className="fab btn-interactive glow-primary ripple-container w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/40 transition-all flex items-center justify-center"
            aria-label="Imprimer"
          >
            <Icons.Printer />
          </button>
        </div>
      </nav>

      {/* Print modal */}
      {isPrintModalOpen && <PrintModal />}

      {/* Toast notifications */}
      {toast && <Toast toast={toast} />}

      {/* Print view - hidden on screen, visible when printing */}
      <PrintView />
    </div>
  );
}

export default App;
