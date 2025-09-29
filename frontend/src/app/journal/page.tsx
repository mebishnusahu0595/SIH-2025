"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Download, Plus, TrendingUp, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { MoodSlider } from "@/components/MoodSlider";
import { useJournalStore } from "@/stores/journalStore";
import { formatDate, formatTime } from "@/lib/utils";
import { MOOD_LEVELS } from "@/lib/constants";

export default function JournalPage() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [mood, setMood] = useState(3);

  const { entries, addEntry, deleteEntry, getAverageMood, exportEntries } = useJournalStore();
  const { register, handleSubmit, reset, watch } = useForm();

  const content = watch("content");
  const averageMood = getAverageMood();

  const onSubmit = (data: Record<string, unknown>) => {
    const content = data.content as string;
    const tags = data.tags as string | undefined;
    addEntry(content, mood, tags ? tags.split(",").map((tag: string) => tag.trim()) : []);
    reset();
    setMood(3);
    setShowNewEntry(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      deleteEntry(id);
    }
  };

  const getMoodEmoji = (moodValue: number) => {
    const moodLevel = MOOD_LEVELS.find(level => level.value === moodValue);
    return moodLevel ? moodLevel.emoji : "😐";
  };

  const getMoodColor = (moodValue: number) => {
    const moodLevel = MOOD_LEVELS.find(level => level.value === moodValue);
    return moodLevel ? moodLevel.color : "#eab308";
  };

  if (showNewEntry) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">New Journal Entry</h1>
          <Button
            onClick={() => {
              setShowNewEntry(false);
              reset();
              setMood(3);
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <div className="border border-black/20 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-black">How are you feeling today?</h2>
            <p className="text-black">Take a moment to reflect on your thoughts and emotions.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Current Mood</label>
              <MoodSlider value={mood} onChange={setMood} />
            </div>

            <Textarea
              label="Journal Entry"
              placeholder="Write about your day, thoughts, feelings, or anything that's on your mind..."
              {...register("content", { required: true })}
              className="min-h-[200px]"
            />

            <Input
              label="Tags (optional)"
              placeholder="work, anxiety, gratitude, goals (comma-separated)"
              {...register("tags")}
            />

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-600">
                {content ? `${content.length} characters` : "0 characters"}
              </p>
              <Button type="submit" disabled={!content || content.length < 10}>
                Save Entry
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-semibold">Journal & Mood Tracker</h1>
          <p className="text-black mt-1">
            Track your daily thoughts and emotions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportEntries} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📝</div>
            <div>
              <p className="text-sm font-medium">Total Entries</p>
              <p className="text-2xl font-semibold">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getMoodEmoji(Math.round(averageMood))}</div>
            <div>
              <p className="text-sm font-medium">Average Mood (30 days)</p>
              <p className="text-2xl font-semibold">{averageMood.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium">This Week</p>
              <p className="text-2xl font-semibold">
                {entries.filter(entry => {
                  const entryDate = new Date(entry.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return entryDate >= weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        
        {entries.length === 0 ? (
          <div className="border border-black/20 bg-white p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No entries yet</h3>
            <p className="text-black mb-4">
              Start journaling to track your thoughts and mood over time.
            </p>
            <Button onClick={() => setShowNewEntry(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-black/20 bg-white hover:shadow-md transition-shadow">
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getMoodColor(entry.mood) }}
                      >
                        {getMoodEmoji(entry.mood)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">{formatDate(new Date(entry.date))}</h3>
                        <p className="text-sm text-black">{formatTime(new Date(entry.date))}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => setSelectedEntry(entry.id === selectedEntry ? null : entry.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(entry.id)}
                        variant="ghost"
                        size="sm"
                        className="text-black hover:text-black"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-black whitespace-pre-wrap mb-3 leading-relaxed">
                    {entry.content}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white border border-black/20 text-black text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="border border-black/20 bg-white p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-black mt-0.5" />
          <div className="text-sm text-black">
            <p className="font-medium mb-1">Privacy & Data</p>
            <p>
              Your journal entries are stored locally on your device. You can export your data at any time. 
              Consider sharing insights from your journaling with a mental health professional during sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur border-t border-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">♥</span>
              </div>
              <span className="font-semibold text-black">MindSupport</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600">
                © {new Date().getFullYear()} MindSupport. Professional counselor connections for your mental health journey.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
}

