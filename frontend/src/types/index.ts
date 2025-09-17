export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date | string | number;
  type?: "text" | "crisis_alert";
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  sessionId: string;
  isVoiceEnabled: boolean;
  crisisDetected: boolean;
}

export interface JournalEntry {
  id: string;
  date: Date | string | number;
  content: string;
  mood: number; // 1-5 scale
  tags?: string[];
}

export interface ScreeningResult {
  id: string;
  type: "PHQ9" | "GAD7";
  score: number;
  responses: number[];
  date: Date | string | number;
  interpretation: string;
  recommendation: "self-care" | "counselor" | "emergency";
}

export interface Counselor {
  id: string;
  name: string;
  specialties: string[];
  credentials: string;
  bio: string;
  availability: string;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
  isVerified: boolean;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  dataRetention: number; // days
}