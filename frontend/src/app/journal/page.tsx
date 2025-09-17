"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Download, Plus, TrendingUp, Edit3, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const { entries, addEntry, updateEntry, deleteEntry, getAverageMood, exportEntries } = useJournalStore();
  const { register, handleSubmit, reset, watch } = useForm();

  const content = watch("content");
  const averageMood = getAverageMood();

  const onSubmit = (data: any) => {
    addEntry(data.content, mood, data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : []);
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

        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Take a moment to reflect on your thoughts and emotions.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Journal & Mood Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <p className="text-sm font-medium">Total Entries</p>
                <p className="text-2xl font-semibold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getMoodEmoji(Math.round(averageMood))}</div>
              <div>
                <p className="text-sm font-medium">Average Mood (30 days)</p>
                <p className="text-2xl font-semibold">{averageMood.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
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
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">No entries yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start journaling to track your thoughts and mood over time.
              </p>
              <Button onClick={() => setShowNewEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getMoodColor(entry.mood) }}
                      >
                        {getMoodEmoji(entry.mood)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{formatDate(new Date(entry.date))}</CardTitle>
                        <CardDescription>{formatTime(new Date(entry.date))}</CardDescription>
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
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
                    {entry.content}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Privacy & Data</p>
              <p>
                Your journal entries are stored locally on your device. You can export your data at any time. 
                Consider sharing insights from your journaling with a mental health professional during sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

