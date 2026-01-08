// ============================================================
// Types & Interfaces for Moodix Application
// ============================================================

// --- User & Auth Types ---
export interface User {
  id: number;
  username: string;
  email?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean | null;
  isAdmin: boolean;
  currentUserId: number | null;
}

// --- Settings Types ---
export interface Consumable {
  key: string;
  label: string;
  icon: IconName;
  active: boolean;
  color: string;
  bg: string;
  border: string;
}

export type ThemeMode = 'dark' | 'light';
export type ColorScheme = 'violet' | 'blue' | 'green' | 'rose' | 'orange';
export type Language = 'fr' | 'en';

export interface Settings {
  lang: Language;
  theme: ThemeMode;
  colorScheme: ColorScheme;
  notificationsEnabled: boolean;
  notificationTime: string;
  consumables: Consumable[];
}

// --- Journal Entry Types ---
export interface Activity {
  id: number;
  name: string;
  plaisir: number;
  maitrise: number;
  satisfaction: number;
}

export interface ActivitySlot {
  slot: string;
  activities: Activity[];
}

export interface Emotion {
  id: number;
  name: string;
  score: number;
}

export interface ThoughtItem {
  id: number;
  text: string;
}

export interface BehaviorItem {
  id: number;
  text: string;
}

export interface ConsequenceItem {
  id: number;
  text: string;
}

export interface ViciousCycle {
  id: number;
  situation: string;
  emotions: Emotion[];
  thoughts: ThoughtItem[];
  behaviors: BehaviorItem[];
  consequences: ConsequenceItem[];
}

export interface ConsumableEntry {
  time: string;
}

export interface JournalEntry {
  date: string;
  day: string;
  bedtime: string[];
  wakeup: string[];
  sleepHours: boolean[];
  exercise: ConsumableEntry[];
  caffeine: ConsumableEntry[];
  cannabis: ConsumableEntry[];
  medication: ConsumableEntry[];
  custom: ConsumableEntry[];
  activityLog: ActivitySlot[];
  viciousCycles: ViciousCycle[];
  generalMood: string;
  dailyNote: string;
  thoughts: string;
}

export type Entries = Record<string, JournalEntry>;

// --- UI Types ---
export type TabName = 'sleep' | 'activities' | 'cycles' | 'stats' | 'settings';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';
export type ToastType = 'success' | 'error' | 'warning';

export interface Toast {
  msg: string;
  type: ToastType;
}

export interface PrintConfig {
  sleep: boolean;
  activities: boolean;
  cycles: boolean;
}

// --- Icon Types ---
export type IconName =
  | 'Moon'
  | 'Sun'
  | 'Save'
  | 'Printer'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'X'
  | 'Chart'
  | 'List'
  | 'Brain'
  | 'Dumbbell'
  | 'Coffee'
  | 'Leaf'
  | 'Pill'
  | 'Check'
  | 'Refresh'
  | 'Plus'
  | 'Trash'
  | 'Cog'
  | 'Beer'
  | 'Cigarette'
  | 'Skull'
  | 'Download'
  | 'Upload'
  | 'Loading'
  | 'CheckSmall'
  | 'Users'
  | 'Key'
  | 'Edit'
  | 'UserPlus'
  | 'Shield'
  | 'ChevronDown';

// --- API Types ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SaveResult {
  success: boolean;
  mode: 'online' | 'offline';
  queued?: boolean;
}

export interface ApiStatus {
  online: boolean;
  lastSave: string | null;
  queueLength: number;
  retryAttempts: number;
}

// --- Component Props Types ---
export interface IconProps {
  className?: string;
}

export interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavBtnProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  active: boolean;
  onClick: () => void;
}

export interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export interface MultiTimeInputProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  values: string[];
  onChange: (values: string[]) => void;
  color: string;
  iconClass?: string;
}

export interface ConsumableRowProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  items: ConsumableEntry[];
  onAdd: (time: string) => void;
  onRemove: (index: number) => void;
  consumableKey: string;
  iconClass?: string;
}
