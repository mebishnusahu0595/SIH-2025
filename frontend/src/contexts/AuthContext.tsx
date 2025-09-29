// Authentication Context for React
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateSessionId, getNamespacedStorage } from '@/lib/utils';
import { Message } from "@/types";
import { STORAGE_KEYS } from '@/lib/constants';
import { API_ENDPOINTS } from '@/lib/constants';
import { useChatStore } from '@/stores/chatStore';
import { useJournalStore } from '@/stores/journalStore';
import { useScreeningStore } from '@/stores/screeningStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  is_verified: boolean;
  phone?: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (data: RegisterData) => Promise<User | { message: string }>;
  logout: () => void; 
  loading: boolean;
  updateProfile: (data: Partial<RegisterData>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'patient' | 'doctor';
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  specialization?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Hydrate per-user persisted zustand stores on initial load
      (async () => {
        try {
          await hydrateUserStores();
        } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
          // ignore
        }
      })();

      // Fallback: attempt hydration again in next tick to avoid races
      try {
        setTimeout(async () => {
          try { await hydrateUserStores(); } catch { /* ignore */ }
        }, 0);
      } catch { /* ignore */ }

      // Debug: print user_data and namespaced storage keys to help diagnose
      try {
        const parsed = (() => {
          try { return JSON.parse(savedUser); } catch { return null; }
        })();
        const uid = parsed?.id || parsed?._id || null;
        console.debug('[AuthProvider] savedUser present', !!savedUser, 'uid=', uid);
        const keys = [STORAGE_KEYS.chatHistory, STORAGE_KEYS.screeningResults, STORAGE_KEYS.journalEntries];
        keys.forEach((base) => {
          try {
            const key = uid ? `${base}_user_${uid}` : `${base}_anon`;
            const v = localStorage.getItem(key);
            console.debug('[AuthProvider] storage key=', key, 'hasValue=', !!v, 'preview=', v ? v.substring(0, 120) : null);
          } catch {
            /* ignore */
          }
        });
      } catch {
        // ignore debug errors
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      try {
        // After setting user_data, hydrate per-user persisted zustand stores
        await hydrateUserStores();
      } catch {
        // ignore storage errors
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const endpoint = `${API_BASE_URL}/api/auth/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }
      const result = await response.json();
      if (result.message) {
        // Doctor registration, don't log in
        setLoading(false);
        return result;
      } else {
        // Patient registration, log in
        setUser(result);
        localStorage.setItem('user_data', JSON.stringify(result));
        try {
          await hydrateUserStores();
        } catch {
          // ignore storage errors
        }
        setLoading(false);
        return result;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<RegisterData>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Profile update failed');
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // remove only the main user_data so app knows nobody is logged in
    try {
      localStorage.removeItem('user_data');
    } catch {
      // ignore storage errors
    }

    // Clear in-memory zustand stores so UI updates immediately
    try {
      // chat
      const chatStore = useChatStore.getState();
      if (chatStore?.clearChat) chatStore.clearChat();

      // journal
      const journalStore = useJournalStore.getState();
      if (journalStore) useJournalStore.setState({ entries: [] });

      // screening
      const screeningStore = useScreeningStore.getState();
      if (screeningStore) useScreeningStore.setState({ results: [] });
    } catch {
      // ignore
    }
  };

  // Hydration helper used both on mount and after login
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const hydrateUserStores = async () => {
    try {
      // Chat
      const chatStorage = getNamespacedStorage(STORAGE_KEYS.chatHistory);
      const rawChat = chatStorage.getItem(STORAGE_KEYS.chatHistory);
      if (rawChat) {
        try {
          const parsed = JSON.parse(rawChat);
          const chatState: { messages?: Message[]; sessionId?: string } = {};
          if (Array.isArray(parsed.messages)) chatState.messages = parsed.messages;
          if (parsed.sessionId) chatState.sessionId = parsed.sessionId;
          // apply to store
          try { useChatStore.setState(chatState); } catch (_e) { /* ignore */ }
        } catch (_e) {
          // ignore parse errors
        }
      } else {
        // initialize chat storage with sessionId if missing
        const init = JSON.stringify({ messages: [], sessionId: generateSessionId() });
        try { chatStorage.setItem(STORAGE_KEYS.chatHistory, init); } catch (_e) { /* ignore */ }
      }

      // Screening
      const screeningStorage = getNamespacedStorage(STORAGE_KEYS.screeningResults);
      const rawScreen = screeningStorage.getItem(STORAGE_KEYS.screeningResults);
      if (rawScreen) {
        try {
          const parsed = JSON.parse(rawScreen);
          if (Array.isArray(parsed)) {
            try { useScreeningStore.setState({ results: parsed }); } catch (_e) { /* ignore */ }
          } else if (parsed.results && Array.isArray(parsed.results)) {
            try { useScreeningStore.setState({ results: parsed.results }); } catch (_e) { /* ignore */ }
          }
        } catch (_e) {
          // ignore
        }
      }

      // Journal
      const journalStorage = getNamespacedStorage(STORAGE_KEYS.journalEntries);
      const rawJournal = journalStorage.getItem(STORAGE_KEYS.journalEntries);
      if (rawJournal) {
        try {
          const parsed = JSON.parse(rawJournal);
          if (Array.isArray(parsed)) {
            try { useJournalStore.setState({ entries: parsed }); } catch (_e) { /* ignore */ }
          } else if (parsed.entries && Array.isArray(parsed.entries)) {
            try { useJournalStore.setState({ entries: parsed.entries }); } catch (_e) { /* ignore */ }
          }
        } catch (_e) {
          // ignore
        }
      }
    } catch (_e) {
      // ignore any storage errors during hydrate
    }

    // After local hydration, attempt to fetch server-side persisted data for the logged-in user
    try {
      const raw = localStorage.getItem('user_data');
      const parsed = raw ? JSON.parse(raw) : null;
      const uid = parsed?.id || parsed?._id || null;
      if (uid) {
        console.log('[hydrateUserStores] Fetching server data for user:', uid);
        // Fetch journal entries from server (best-effort)
        try {
          console.log('[hydrateUserStores] Fetching journal from:', `${API_BASE_URL}${API_ENDPOINTS.journal}`);
          const journalRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.journal}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': uid
            }
          });
          console.log('[hydrateUserStores] Journal fetch status:', journalRes.status);
          if (journalRes.ok) {
            const serverJournal = await journalRes.json();
            console.log('[hydrateUserStores] Server journal data:', serverJournal);
            if (Array.isArray(serverJournal)) {
              const transformedJournal = serverJournal.map(j => ({
                id: j.id,
                date: new Date(j.created_at),
                content: j.content,
                mood: j.mood_score,
                tags: j.tags
              }));
              try { 
                useJournalStore.setState({ entries: transformedJournal });
                console.log('[hydrateUserStores] Journal store updated with:', useJournalStore.getState().entries);
              } catch (_e) { /* ignore */ }
            }
          } else {
            console.log('[hydrateUserStores] Journal fetch failed:', await journalRes.text());
          }
        } catch (_e) { console.log('[hydrateUserStores] Journal fetch error:', _e); }

        // Fetch screening history from server (best-effort)
        try {
          console.log('[hydrateUserStores] Fetching screening from:', `${API_BASE_URL}${API_ENDPOINTS.screening}/history`);
          const screeningRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.screening}/history`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': uid
            }
          });
          console.log('[hydrateUserStores] Screening fetch status:', screeningRes.status);
          if (screeningRes.ok) {
            const serverScreenings = await screeningRes.json();
            console.log('[hydrateUserStores] Server screening data:', serverScreenings);
            if (Array.isArray(serverScreenings)) {
              const transformedScreenings = serverScreenings.map(s => ({
                id: s.id,
                type: s.screening_type.toUpperCase() as "PHQ9" | "GAD7",
                score: s.total_score,
                responses: s.responses.map((r: { score: number }) => r.score),
                date: new Date(s.created_at),
                interpretation: s.interpretation,
                recommendation: (s.crisis_detected ? "emergency" : s.severity === "severe" ? "emergency" : s.severity === "moderate" ? "counselor" : "self-care") as "self-care" | "counselor" | "emergency"
              }));
              try { 
                useScreeningStore.setState({ results: transformedScreenings });
                console.log('[hydrateUserStores] Screening store updated with:', useScreeningStore.getState().results);
              } catch (_e) { /* ignore */ }
            }
          } else {
            console.log('[hydrateUserStores] Screening fetch failed:', await screeningRes.text());
          }
        } catch (_e) { console.log('[hydrateUserStores] Screening fetch error:', _e); }
      } else {
        console.log('[hydrateUserStores] No user ID found, skipping server fetch');
      }
    } catch (_e) {
      console.log('[hydrateUserStores] General error in server fetch:', _e);
    }
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
  fallback?: React.ReactNode;
}> = ({ children, requiredRole, fallback }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }
  if (!user) {
    return fallback || <div>Please login to access this page</div>;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <div>You don&apos;t have permission to access this page</div>;
  }
  return <>{children}</>;
};

