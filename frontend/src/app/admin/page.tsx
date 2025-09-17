"use client";

import { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  Eye,
  Plus,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chatStore";
import { useJournalStore } from "@/stores/journalStore";
import { useScreeningStore } from "@/stores/screeningStore";
import { formatDate, formatTime } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalChats: number;
  crisisFlags: number;
  avgMood: number;
  screeningsCompleted: number;
}

interface FlaggedConversation {
  id: string;
  sessionId: string;
  lastMessage: string;
  flagReason: string;
  timestamp: Date;
  resolved: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'counselors' | 'analytics'>('overview');
  const [showAddCounselor, setShowAddCounselor] = useState(false);
  
  const { messages } = useChatStore();
  const { entries } = useJournalStore();
  const { results } = useScreeningStore();

  // Mock admin stats - in real app, fetch from API
  const stats: AdminStats = {
    totalUsers: 1247,
    totalChats: messages.length || 156,
    crisisFlags: 3,
    avgMood: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length : 3.2,
    screeningsCompleted: results.length || 89
  };

  // Mock flagged conversations
  const flaggedChats: FlaggedConversation[] = [
    {
      id: "1",
      sessionId: "sess_abc123",
      lastMessage: "I can't take this anymore...",
      flagReason: "Crisis keywords detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      resolved: false
    },
    {
      id: "2", 
      sessionId: "sess_def456",
      lastMessage: "Everything feels hopeless",
      flagReason: "Depression indicators",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      resolved: false
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Chat Sessions</p>
                <p className="text-2xl font-semibold">{stats.totalChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium">Crisis Flags</p>
                <p className="text-2xl font-semibold">{stats.crisisFlags}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Mood</p>
                <p className="text-2xl font-semibold">{stats.avgMood.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Screenings</CardTitle>
            <CardDescription>Latest mental health assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{result.type}</p>
                    <p className="text-sm text-gray-600">Score: {result.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatDate(new Date(result.date))}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      result.recommendation === 'self-care' ? 'bg-green-100 text-green-800' :
                      result.recommendation === 'counselor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flagged Conversations</CardTitle>
            <CardDescription>Chats requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flaggedChats.map((chat) => (
                <div key={chat.id} className="flex items-start justify-between p-3 border rounded bg-red-50 dark:bg-red-950">
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {chat.flagReason}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      "{chat.lastMessage}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(chat.timestamp)} - Session: {chat.sessionId}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderChatManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat Management</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crisis Interventions Required</CardTitle>
          <CardDescription>Conversations flagged for immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flaggedChats.map((chat) => (
              <div key={chat.id} className="border rounded-lg p-4 bg-red-50 dark:bg-red-950">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-800 dark:text-red-200">
                        {chat.flagReason}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Last Message:</strong> "{chat.lastMessage}"
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Session ID: {chat.sessionId} | {formatDate(chat.timestamp)} at {formatTime(chat.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Full Chat
                    </Button>
                    <Button size="sm">
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCounselorManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Counselor Management</h2>
        <Button onClick={() => setShowAddCounselor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Counselor
        </Button>
      </div>

      {showAddCounselor && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Counselor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Credentials" />
              <Input placeholder="Email" />
              <Input placeholder="Phone" />
              <Input placeholder="Website" />
              <Input placeholder="Specialties (comma-separated)" />
            </div>
            <div className="mt-4">
              <textarea 
                placeholder="Bio and description..."
                className="w-full h-24 p-3 border rounded-md"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Save Counselor</Button>
              <Button variant="outline" onClick={() => setShowAddCounselor(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Counselors</CardTitle>
          <CardDescription>Manage verified mental health professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Dr. Sarah Johnson", status: "Active", patients: 12 },
              { name: "Michael Chen, LCSW", status: "Active", patients: 8 },
              { name: "Dr. Emily Rodriguez", status: "Pending", patients: 0 }
            ].map((counselor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{counselor.name}</p>
                  <p className="text-sm text-gray-600">
                    {counselor.patients} active patients
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    counselor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {counselor.status}
                  </span>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics & Insights</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-gray-500">
              Chart placeholder - implement with chart library
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { mood: "Great", count: 23, percentage: 35 },
                { mood: "Good", count: 18, percentage: 28 },
                { mood: "Okay", count: 15, percentage: 23 },
                { mood: "Low", count: 7, percentage: 11 },
                { mood: "Very Low", count: 2, percentage: 3 }
              ].map((item) => (
                <div key={item.mood} className="flex items-center justify-between">
                  <span>{item.mood}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor platform health and manage resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600">System Healthy</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'chats', label: 'Chat Management', icon: MessageSquare },
            { id: 'counselors', label: 'Counselors', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'chats' && renderChatManagement()}
      {activeTab === 'counselors' && renderCounselorManagement()}
      {activeTab === 'analytics' && renderAnalytics()}

      {/* Security Notice */}
      <Card className="border-amber-500 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Security & Privacy Notice</p>
              <p>
                All data shown here is anonymized. Personal identifying information is never displayed. 
                Access to this dashboard is logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

