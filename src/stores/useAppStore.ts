import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Settings,
  JournalEntry,
  Entries,
  TabName,
  Toast,
  ToastType,
  SaveStatus,
  PrintConfig,
  ActivitySlot,
  ViciousCycle,
  ConsumableEntry,
} from '@/types';
import { DEFAULT_SETTINGS, TIME_SLOTS } from '@/utils/constants';
import { api, offlineQueue } from '@/api';
import { generateId, getDayName } from '@/utils/helpers';

// --- Auth Store ---
interface AuthState {
  isAuthenticated: boolean | null;
  isAdmin: boolean;
  currentUserId: number | null;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      isAuthenticated: true, // Bypass login for GH Pages demo
      isAdmin: true, // Grant admin rights for the demo to show all UI elements
      currentUserId: 1, // Use a mock user ID for the demo

      checkAuth: async () => {
        // Do nothing in demo mode
        set({ isAuthenticated: true, isAdmin: true, currentUserId: 1 });
        return Promise.resolve();
      },

      login: async (username: string, password: string) => {
        // Do nothing in demo mode
        console.log('Login attempt in demo mode:', username, password);
        return Promise.resolve(true);
      },

      logout: async () => {
        // Do nothing in demo mode
        set({ isAuthenticated: true, isAdmin: true, currentUserId: 1 });
      },
    }),
    { name: 'auth-store' }
  )
);

// --- Settings Store ---
interface SettingsState {
  settings: Settings;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  updateConsumable: (index: number, field: string, value: unknown) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        settings: DEFAULT_SETTINGS,

        loadSettings: async () => {
          const remote = await api.loadSettings();
          if (remote && Object.keys(remote).length > 0) {
            // Merge consumables with defaults to ensure color/bg are present
            const mergedConsumables = DEFAULT_SETTINGS.consumables.map((defaultItem, idx) => {
              const remoteItem = remote.consumables?.[idx];
              if (remoteItem) {
                return {
                  ...defaultItem,
                  ...remoteItem,
                  // Always use default colors if not present
                  color: remoteItem.color || defaultItem.color,
                  bg: remoteItem.bg || defaultItem.bg,
                };
              }
              return defaultItem;
            });
            set({ settings: { ...get().settings, ...remote, consumables: mergedConsumables } });
          }
        },

        updateSetting: (key, value) => {
          const updated = { ...get().settings, [key]: value };
          set({ settings: updated });
          void api.saveSettings(updated);
        },

        updateSettings: (partial) => {
          const updated = { ...get().settings, ...partial };
          set({ settings: updated });
          void api.saveSettings(updated);
        },

        updateConsumable: (index, field, value) => {
          const consumables = [...get().settings.consumables];
          const consumable = consumables[index];
          if (consumable && field in consumable) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (consumable as any)[field] = value;
          }
          get().updateSettings({ consumables });
        },
      }),
      {
        name: 'settings-storage',
        partialize: (state) => ({ settings: state.settings }),
      }
    ),
    { name: 'settings-store' }
  )
);

// --- Journal Store ---
interface JournalState {
  entries: Entries;
  selectedDate: string;
  currentEntry: JournalEntry | null;
  saveStatus: SaveStatus;

  // Actions
  loadEntries: () => Promise<void>;
  clearEntries: () => void;
  setSelectedDate: (date: string) => void;
  changeDate: (delta: number) => void;
  updateEntry: <K extends keyof JournalEntry>(field: K, value: JournalEntry[K]) => void;
  saveCurrentEntry: () => Promise<void>;

  // Activity actions
  addActivity: (slotIndex: number) => void;
  updateActivity: (slotIndex: number, activityId: number, field: string, value: unknown) => void;
  removeActivity: (slotIndex: number, activityId: number) => void;

  // Cycle actions
  addCycle: () => void;
  updateCycle: (id: number, field: string, value: unknown) => void;
  removeCycle: (id: number) => void;
  addSubItem: (
    cycleId: number,
    field: 'emotions' | 'thoughts' | 'behaviors' | 'consequences',
    item: Record<string, unknown>
  ) => void;
  updateSubItem: (
    cycleId: number,
    field: 'emotions' | 'thoughts' | 'behaviors' | 'consequences',
    itemId: number,
    subField: string,
    value: unknown
  ) => void;
  removeSubItem: (
    cycleId: number,
    field: 'emotions' | 'thoughts' | 'behaviors' | 'consequences',
    itemId: number
  ) => void;

  // Consumable actions
  addConsumable: (key: string, time: string) => void;
  removeConsumable: (key: string, index: number) => void;
}

const createEmptyEntry = (date: string, lang: 'fr' | 'en' = 'fr'): JournalEntry => ({
  date,
  day: getDayName(date, lang),
  bedtime: [],
  wakeup: [],
  sleepHours: Array(24).fill(false) as boolean[],
  exercise: [],
  caffeine: [],
  cannabis: [],
  medication: [],
  custom: [],
  activityLog: TIME_SLOTS.map((slot) => ({ slot, activities: [] })),
  viciousCycles: [],
  generalMood: '',
  dailyNote: '',
  thoughts: '',
});

export const useJournalStore = create<JournalState>()(
  devtools(
    (set, get) => ({
      entries: {},
      selectedDate: new Date().toISOString().split('T')[0],
      currentEntry: null,
      saveStatus: 'idle',

      loadEntries: async () => {
        const data = await api.load();
        if (!data) {
          set({ entries: {} });
          return;
        }

        // Transform API data to local format
        const transformed: Entries = {};
        const lang = useSettingsStore.getState().settings.lang;

        Object.keys(data).forEach((date) => {
          const apiEntry = data[date];

          // Handle both activityLog and legacy timeSlots format
          let activityLog: ActivitySlot[] = [];

          if (apiEntry.activityLog && Array.isArray(apiEntry.activityLog) && apiEntry.activityLog.length > 0) {
            // New format: activityLog with slot property
            activityLog = apiEntry.activityLog.map(
              (slot: { slot?: string; time?: string; activities?: unknown[] }) => ({
                slot: slot.slot || slot.time || '0:00',
                activities: slot.activities || [],
              }) as ActivitySlot
            );
          } else if ((apiEntry as unknown as { timeSlots?: unknown[] }).timeSlots) {
            // Legacy format: timeSlots with time property
            const timeSlots = (apiEntry as unknown as { timeSlots: { time?: string; slot?: string; activities?: unknown[] }[] }).timeSlots;
            activityLog = timeSlots.map(
              (ts) => ({
                slot: ts.time || ts.slot || '0:00',
                activities: ts.activities || [],
              }) as ActivitySlot
            );
          }

          const finalActivityLog =
            activityLog.length > 0
              ? activityLog
              : TIME_SLOTS.map((slot) => ({ slot, activities: [] }));

          transformed[date] = {
            ...apiEntry,
            day: getDayName(date, lang),
            bedtime: Array.isArray(apiEntry.bedtime)
              ? apiEntry.bedtime
              : apiEntry.bedtime
                ? [apiEntry.bedtime]
                : [],
            wakeup: Array.isArray(apiEntry.wakeup)
              ? apiEntry.wakeup
              : apiEntry.wakeup
                ? [apiEntry.wakeup]
                : [],
            sleepHours: apiEntry.sleepHours || Array(24).fill(false),
            caffeine: apiEntry.caffeine || [],
            exercise: apiEntry.exercise || [],
            medication: apiEntry.medication || [],
            cannabis: apiEntry.cannabis || [],
            custom: apiEntry.custom || [],
            activityLog: finalActivityLog,
            viciousCycles: apiEntry.viciousCycles || [],
            generalMood: apiEntry.generalMood || '',
            dailyNote: apiEntry.dailyNote || '',
            thoughts: apiEntry.thoughts || '',
          };
        });

        set({ entries: transformed });

        // Load current entry for selected date
        const selectedDate = get().selectedDate;
        const currentEntry =
          transformed[selectedDate] ||
          createEmptyEntry(selectedDate, useSettingsStore.getState().settings.lang);
        set({ currentEntry });

        // Process offline queue
        setTimeout(async () => {
          const processed = await offlineQueue.processQueue();
          if (processed > 0) {
            useUIStore.getState().showToast(`${processed} entrée(s) synchronisée(s)`, 'success');
            await get().loadEntries();
          }
        }, 1000);
      },

      clearEntries: () => {
        set({ entries: {}, currentEntry: null });
      },

      setSelectedDate: (date: string) => {
        const { entries } = get();
        const lang = useSettingsStore.getState().settings.lang;
        const entry = entries[date] || createEmptyEntry(date, lang);
        set({ selectedDate: date, currentEntry: entry });
      },

      changeDate: (delta: number) => {
        const { selectedDate } = get();
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        get().setSelectedDate(d.toISOString().split('T')[0]);
      },

      updateEntry: (field, value) => {
        const { currentEntry } = get();
        if (!currentEntry) return;
        set({ currentEntry: { ...currentEntry, [field]: value } });
      },

      saveCurrentEntry: async () => {
        const { currentEntry, entries } = get();
        if (!currentEntry) return;

        set({ saveStatus: 'saving' });

        // Filter out activities without a name before saving
        const cleanedEntry = {
          ...currentEntry,
          activityLog: currentEntry.activityLog.map(slot => ({
            ...slot,
            activities: slot.activities.filter(a => a.name.trim() !== ''),
          })),
        };

        const result = await api.save(cleanedEntry);

        if (result.success) {
          // Don't update currentEntry - keep empty activities in UI while user is editing
          // Only update entries cache with cleaned version for persistence
          set({
            entries: { ...entries, [cleanedEntry.date]: cleanedEntry },
            saveStatus: result.mode === 'offline' ? 'offline' : 'saved',
          });

          // Only show toast for offline mode, otherwise the status dot is enough
          if (result.mode === 'offline' || result.queued) {
            useUIStore.getState().showToast('Sauvegardé localement (hors ligne)', 'warning');
          }

          setTimeout(() => set({ saveStatus: 'idle' }), 2000);
        } else {
          set({ saveStatus: 'error' });
          useUIStore.getState().showToast('Erreur sauvegarde', 'error');
        }
      },

      // Activity actions
      addActivity: (slotIndex: number) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const newLog = [...currentEntry.activityLog];
        newLog[slotIndex] = {
          ...newLog[slotIndex],
          activities: [
            ...newLog[slotIndex].activities,
            { id: generateId(), name: '', plaisir: 5, maitrise: 5, satisfaction: 5 },
          ],
        };
        get().updateEntry('activityLog', newLog);
      },

      updateActivity: (slotIndex, activityId, field, value) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const newLog = currentEntry.activityLog.map((slot, i) => {
          if (i !== slotIndex) return slot;
          return {
            ...slot,
            activities: slot.activities.map((a) =>
              a.id === activityId ? { ...a, [field]: value } : a
            ),
          };
        });
        get().updateEntry('activityLog', newLog);
      },

      removeActivity: (slotIndex, activityId) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const newLog = [...currentEntry.activityLog];
        newLog[slotIndex] = {
          ...newLog[slotIndex],
          activities: newLog[slotIndex].activities.filter((a) => a.id !== activityId),
        };
        get().updateEntry('activityLog', newLog);
      },

      // Cycle actions
      addCycle: () => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const newCycle: ViciousCycle = {
          id: generateId(),
          situation: '',
          emotions: [],
          thoughts: [],
          behaviors: [],
          consequences: [],
        };
        get().updateEntry('viciousCycles', [...(currentEntry.viciousCycles || []), newCycle]);
      },

      updateCycle: (id, field, value) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const updated = currentEntry.viciousCycles.map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        );
        get().updateEntry('viciousCycles', updated);
      },

      removeCycle: (id) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        get().updateEntry(
          'viciousCycles',
          currentEntry.viciousCycles.filter((c) => c.id !== id)
        );
      },

      addSubItem: (cycleId, field, item) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const cycle = currentEntry.viciousCycles.find((c) => c.id === cycleId);
        if (!cycle) return;

        get().updateCycle(cycleId, field, [...(cycle[field] || []), { ...item, id: generateId() }]);
      },

      updateSubItem: (cycleId, field, itemId, subField, value) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const cycle = currentEntry.viciousCycles.find((c) => c.id === cycleId);
        if (!cycle) return;

        const updatedItems = cycle[field].map((item) =>
          item.id === itemId ? { ...item, [subField]: value } : item
        );
        get().updateCycle(cycleId, field, updatedItems);
      },

      removeSubItem: (cycleId, field, itemId) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const cycle = currentEntry.viciousCycles.find((c) => c.id === cycleId);
        if (!cycle) return;

        get().updateCycle(
          cycleId,
          field,
          cycle[field].filter((item) => item.id !== itemId)
        );
      },

      // Consumable actions
      addConsumable: (key: string, time: string) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const current = (currentEntry[key as keyof JournalEntry] as ConsumableEntry[]) || [];
        get().updateEntry(key as keyof JournalEntry, [...current, { time }] as JournalEntry[keyof JournalEntry]);
      },

      removeConsumable: (key: string, index: number) => {
        const { currentEntry } = get();
        if (!currentEntry) return;

        const current = (currentEntry[key as keyof JournalEntry] as ConsumableEntry[]) || [];
        get().updateEntry(
          key as keyof JournalEntry,
          current.filter((_, i) => i !== index) as JournalEntry[keyof JournalEntry]
        );
      },
    }),
    { name: 'journal-store' }
  )
);

// --- UI Store ---
interface UIState {
  activeTab: TabName;
  toast: Toast | null;
  isPrintModalOpen: boolean;
  printSelectedDates: string[];
  printConfig: PrintConfig;
  plasmaBlurred: boolean;

  setActiveTab: (tab: TabName) => void;
  showToast: (msg: string, type?: ToastType) => void;
  hideToast: () => void;
  openPrintModal: () => void;
  closePrintModal: () => void;
  togglePrintDate: (date: string) => void;
  setPrintSelectedDates: (dates: string[]) => void;
  togglePrintConfig: (key: keyof PrintConfig) => void;
  setPlasmaBlurred: (blurred: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      activeTab: 'sleep',
      toast: null,
      isPrintModalOpen: false,
      printSelectedDates: [],
      printConfig: { sleep: true, activities: true, cycles: true },
      plasmaBlurred: false,

      setActiveTab: (tab) => set({ activeTab: tab }),

      showToast: (msg, type = 'success') => {
        set({ toast: { msg, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      hideToast: () => set({ toast: null }),

      openPrintModal: () => set({ isPrintModalOpen: true }),

      closePrintModal: () => set({ isPrintModalOpen: false }),

      togglePrintDate: (date) => {
        const { printSelectedDates } = get();
        if (printSelectedDates.includes(date)) {
          set({ printSelectedDates: printSelectedDates.filter((d) => d !== date) });
        } else {
          set({ printSelectedDates: [...printSelectedDates, date] });
        }
      },

      setPrintSelectedDates: (dates) => set({ printSelectedDates: dates }),

      togglePrintConfig: (key) => {
        const { printConfig } = get();
        set({ printConfig: { ...printConfig, [key]: !printConfig[key] } });
      },

      setPlasmaBlurred: (blurred) => set({ plasmaBlurred: blurred }),
    }),
    { name: 'ui-store' }
  )
);
