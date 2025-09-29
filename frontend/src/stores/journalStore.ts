import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JournalEntry } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { getNamespacedStorage } from "@/lib/utils";

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (content: string, mood: number, tags?: string[]) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByDateRange: (startDate: Date, endDate: Date) => JournalEntry[];
  getAverageMood: (days?: number) => number;
  exportEntries: () => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (content: string, mood: number, tags?: string[]) => {
        const entry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          content,
          mood,
          tags,
        };

        set((state) => ({
          entries: [entry, ...state.entries],
        }));

        // Mirror to backend (best-effort)
        (async () => {
          try {
            const { getCurrentUserId } = await import('@/lib/utils');
            const uid = getCurrentUserId();
            const chatStore = (await import('@/stores/chatStore')).useChatStore.getState?.();
            const sessionId = chatStore?.sessionId;

            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';
            const { API_ENDPOINTS } = await import('@/lib/constants');
            await fetch(`${apiBase}${API_ENDPOINTS.journal}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId || '',
                'X-User-ID': uid || '',
              },
              body: JSON.stringify({
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags || [],
              }),
            });
          } catch (e) {
            console.error('Error syncing entry:', e);
            // ignore network errors
          }
        })();
      },

      updateEntry: (id: string, updates: Partial<JournalEntry>) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));

        // Mirror update to backend (best-effort)
        (async () => {
          try {
            const { getCurrentUserId } = await import('@/lib/utils');
            const uid = getCurrentUserId();
            const chatStore = (await import('@/stores/chatStore')).useChatStore.getState?.();
            const sessionId = chatStore?.sessionId;

            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';
            const { API_ENDPOINTS } = await import('@/lib/constants');
            await fetch(`${apiBase}${API_ENDPOINTS.journal}/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId || '',
                'X-User-ID': uid || '',
              },
              body: JSON.stringify(updates),
            });
          } catch (e) {
            console.error('Error updating entry:', e);
            // ignore
          }
        })();
      },

      deleteEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));

        // Mirror delete to backend (best-effort)
        (async () => {
          try {
            const { getCurrentUserId } = await import('@/lib/utils');
            const uid = getCurrentUserId();
            const chatStore = (await import('@/stores/chatStore')).useChatStore.getState?.();
            const sessionId = chatStore?.sessionId;

            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';
            const { API_ENDPOINTS } = await import('@/lib/constants');
            await fetch(`${apiBase}${API_ENDPOINTS.journal}/${id}`, {
              method: 'DELETE',
              headers: {
                'X-Session-ID': sessionId || '',
                'X-User-ID': uid || '',
              },
            });
          } catch (e) {
            console.error('Error deleting entry:', e);
            // ignore
          }
        })();
      },

      getEntriesByDateRange: (startDate: Date, endDate: Date) => {
        const { entries } = get();
        return entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
      },

      getAverageMood: (days = 30) => {
        const { entries } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentEntries = entries.filter(
          (entry) => new Date(entry.date) >= cutoffDate
        );

        if (recentEntries.length === 0) return 0;

        const totalMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0);
        return totalMood / recentEntries.length;
      },

      exportEntries: () => {
        const { entries } = get();
        const dataStr = JSON.stringify(entries, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `journal-entries-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: STORAGE_KEYS.journalEntries,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: getNamespacedStorage(STORAGE_KEYS.journalEntries) as any,
    }
  )
);
