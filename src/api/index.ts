/**
 * API module for Moodix - handles all server communication
 */

import type { JournalEntry, Settings, User, SaveResult, ApiStatus, Entries } from '@/types';
import { safeParseJSON } from '@/utils/helpers';

// --- Offline Queue Manager ---
const QUEUE_KEY = 'offline_save_queue';

interface QueueItem {
  entry: JournalEntry;
  timestamp: number;
}

export const offlineQueue = {
  getQueue: (): QueueItem[] => {
    try {
      return safeParseJSON(localStorage.getItem(QUEUE_KEY) || '[]', []);
    } catch {
      return [];
    }
  },

  addToQueue: (entry: JournalEntry): void => {
    const queue = offlineQueue.getQueue();
    queue.push({ entry, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  removeFromQueue: (index: number): void => {
    const queue = offlineQueue.getQueue();
    queue.splice(index, 1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clearQueue: (): void => {
    localStorage.removeItem(QUEUE_KEY);
  },

  processQueue: async (): Promise<number> => {
    const queue = offlineQueue.getQueue();
    let processed = 0;

    for (let i = queue.length - 1; i >= 0; i--) {
      try {
        const { entry } = queue[i];
        const success = await api._saveToServer(entry);
        if (success) {
          offlineQueue.removeFromQueue(i);
          processed++;
        }
      } catch (e) {
        console.error('Queue processing error:', e);
      }
    }

    return processed;
  },
};

// --- API State ---
let _isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let _lastSaveTime: string | null = null;
let _saveRetryAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// --- API Methods ---
export const api = {
  _isOnline,
  _lastSaveTime,
  _saveRetryAttempts,
  MAX_RETRIES,
  RETRY_DELAY,

  checkAuth: async (): Promise<{ authenticated: boolean; is_admin?: boolean; user_id?: number }> => {
    try {
      const res = await fetch('/api/check-auth', { credentials: 'include' });
      if (!res.ok) return { authenticated: false };
      return (await res.json()) as { authenticated: boolean; is_admin?: boolean; user_id?: number };
    } catch {
      return { authenticated: false };
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<boolean> => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return true;
    } catch {
      return false;
    }
  },

  load: async (): Promise<Entries | null> => {
    try {
      const res = await fetch('/api/entries', { credentials: 'include' });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Server error');
      const data = (await res.json()) as Entries;

      // Save to localStorage as backup
      localStorage.setItem('journal_data', JSON.stringify(data));
      return data;
    } catch {
      console.warn('Loading from localStorage due to server error');
      return safeParseJSON(localStorage.getItem('journal_data') || '{}', {});
    }
  },

  _saveToServer: async (entry: JournalEntry): Promise<boolean> => {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(entry),
    });
    return res.ok;
  },

  save: async (entry: JournalEntry, attempt = 0): Promise<SaveResult> => {
    // Always save to localStorage first for instant persistence
    try {
      const localData = safeParseJSON<Entries>(localStorage.getItem('journal_data') || '{}', {});
      localData[entry.date] = entry;
      localStorage.setItem('journal_data', JSON.stringify(localData));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }

    // Try to save to server
    try {
      const success = await api._saveToServer(entry);

      if (success) {
        _lastSaveTime = new Date().toLocaleTimeString();
        _saveRetryAttempts = 0;

        // Process offline queue if any
        setTimeout(() => void offlineQueue.processQueue(), 100);

        return { success: true, mode: 'online' };
      } else {
        throw new Error('Server returned error');
      }
    } catch {
      // Retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        return api.save(entry, attempt + 1);
      }

      // Add to offline queue after all retries failed
      offlineQueue.addToQueue(entry);
      _saveRetryAttempts = attempt;

      return { success: true, mode: 'offline', queued: true };
    }
  },

  loadSettings: async (): Promise<Settings | null> => {
    try {
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as Settings;
        if (Object.keys(data).length > 0) {
          localStorage.setItem('journal_settings', JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.error('Settings load error:', e);
    }
    const local = localStorage.getItem('journal_settings');
    return local ? safeParseJSON<Settings>(local, null as unknown as Settings) : null;
  },

  saveSettings: async (newSettings: Settings): Promise<void> => {
    localStorage.setItem('journal_settings', JSON.stringify(newSettings));

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error('Settings save error:', e);
    }
  },

  getStatus: (): ApiStatus => ({
    online: _isOnline,
    lastSave: _lastSaveTime,
    queueLength: offlineQueue.getQueue().length,
    retryAttempts: _saveRetryAttempts,
  }),

  // Admin API methods
  admin: {
    listUsers: async (): Promise<{ users: User[] } | null> => {
      try {
        const res = await fetch('/api/admin/users', {
          credentials: 'include',
        });
        if (!res.ok) return null;
        return (await res.json()) as { users: User[] };
      } catch (e) {
        console.error('List users error:', e);
        return null;
      }
    },

    createUser: async (
      username: string,
      password: string,
      email: string,
      isAdmin: boolean
    ): Promise<{ ok: boolean; data: unknown }> => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password, email, is_admin: isAdmin }),
        });
        return { ok: res.ok, data: res.ok ? await res.json() : await res.text() };
      } catch (e) {
        console.error('Create user error:', e);
        return { ok: false, data: (e as Error).message };
      }
    },

    updateUser: async (
      userId: number,
      updates: Partial<User>
    ): Promise<{ ok: boolean; data: unknown }> => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates),
        });
        return { ok: res.ok, data: res.ok ? await res.json() : await res.text() };
      } catch (e) {
        console.error('Update user error:', e);
        return { ok: false, data: (e as Error).message };
      }
    },

    deleteUser: async (userId: number): Promise<{ ok: boolean; data: unknown }> => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        return { ok: res.ok, data: res.ok ? await res.json() : await res.text() };
      } catch (e) {
        console.error('Delete user error:', e);
        return { ok: false, data: (e as Error).message };
      }
    },

    resetPassword: async (
      userId: number,
      newPassword: string
    ): Promise<{ ok: boolean; data: unknown }> => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password: newPassword }),
        });
        return { ok: res.ok, data: res.ok ? await res.json() : await res.text() };
      } catch (e) {
        console.error('Reset password error:', e);
        return { ok: false, data: (e as Error).message };
      }
    },
  },
};

// Monitor online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    _isOnline = true;
    void offlineQueue.processQueue();
  });

  window.addEventListener('offline', () => {
    _isOnline = false;
  });
}

export default api;
