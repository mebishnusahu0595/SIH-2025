import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JournalEntry } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

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
      },

      updateEntry: (id: string, updates: Partial<JournalEntry>) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
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
    }
  )
);