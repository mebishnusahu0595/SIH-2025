import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, ChatState } from "@/types";
import { STORAGE_KEYS, CRISIS_KEYWORDS } from "@/lib/constants";
import { generateSessionId, getNamespacedStorage } from "@/lib/utils";

interface ChatStore extends ChatState {
  addMessage: (content: string, sender: "user" | "bot", type?: "text" | "crisis_alert") => void;
  setTyping: (isTyping: boolean) => void;
  toggleVoice: () => void;
  clearChat: () => void;
  checkForCrisis: (message: string) => boolean;
  setCrisisDetected: (detected: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      sessionId: generateSessionId(),
      isVoiceEnabled: false,
      crisisDetected: false,

      addMessage: (content: string, sender: "user" | "bot", type = "text") => {
        const message: Message = {
          id: Date.now().toString(),
          content,
          sender,
          timestamp: new Date(),
          type,
        };

        set((state) => ({
          messages: [...state.messages, message],
        }));

        // Check for crisis if it's a user message
        if (sender === "user") {
          const crisisDetected = get().checkForCrisis(content);
          if (crisisDetected) {
            get().setCrisisDetected(true);
          }
        }
      },

      setTyping: (isTyping: boolean) => set({ isTyping }),

      toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),

      clearChat: () =>
        set({
          messages: [],
          isTyping: false,
          crisisDetected: false,
          sessionId: generateSessionId(),
        }),

      checkForCrisis: (message: string) => {
        const lowerMessage = message.toLowerCase();
        return CRISIS_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
      },

      setCrisisDetected: (detected: boolean) => set({ crisisDetected: detected }),
    }),
    {
      name: STORAGE_KEYS.chatHistory,
      // persist per-user so chats are isolated between users
      storage: getNamespacedStorage(STORAGE_KEYS.chatHistory) as any,
      partialize: (state) => ({
        messages: state.messages,
        sessionId: state.sessionId,
      }),
    }
  )
);