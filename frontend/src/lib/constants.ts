export const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end it all", "want to die", "better off dead",
  "no point living", "can't go on", "self harm", "hurt myself", "overdose",
  "jump", "pills", "rope", "gun", "blade", "cut myself", "worthless",
  "hopeless", "give up", "can't take it", "ending it"
];

export const CRISIS_RESOURCES = {
  us: {
    national: "988", // Suicide & Crisis Lifeline
    text: "Text HOME to 741741", // Crisis Text Line
    emergency: "911"
  },
  international: [
    { country: "UK", number: "116 123", name: "Samaritans" },
    { country: "Canada", number: "1-833-456-4566", name: "Talk Suicide Canada" },
    { country: "Australia", number: "13 11 14", name: "Lifeline" },
    { country: "India", number: "91-9152987821", name: "AASRA" }
  ]
};

export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

export const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

export const MOOD_LEVELS = [
  { value: 1, label: "Very Low", emoji: "😰", color: "#ef4444" },
  { value: 2, label: "Low", emoji: "😔", color: "#f97316" },
  { value: 3, label: "Okay", emoji: "😐", color: "#eab308" },
  { value: 4, label: "Good", emoji: "🙂", color: "#22c55e" },
  { value: 5, label: "Great", emoji: "😊", color: "#16a34a" }
];

export const API_ENDPOINTS = {
  chat: "/api/chat",
  screening: "/api/screening",
  journal: "/api/journal",
  counselors: "/api/counselors",
  admin: "/api/admin"
};

export const STORAGE_KEYS = {
  sessionId: "mindsupport_session_id",
  chatHistory: "mindsupport_chat_history",
  journalEntries: "mindsupport_journal_entries",
  screeningResults: "mindsupport_screening_results",
  userPreferences: "mindsupport_preferences"
};