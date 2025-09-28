import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | number): string {
  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    // Fallback to current date if there's any error
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export function formatTime(date: Date | string | number): string {
  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    // Fallback to current time if there's any error
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function exportToJson(data: any, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Helper to read current user id from localStorage-stored user_data
export function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?._id || null;
  } catch (e) {
    return null;
  }
}

// Returns a storage object compatible with zustand persist that prefixes
// the base key with the current user id so each user's persisted state is isolated.
export function getNamespacedStorage(baseKey: string) {
  return {
    getItem: (name: string) => {
      const uid = getCurrentUserId();
      const key = uid ? `${baseKey}_user_${uid}` : `${baseKey}_anon`;
      return localStorage.getItem(key);
    },
    setItem: (name: string, value: string) => {
      const uid = getCurrentUserId();
      const key = uid ? `${baseKey}_user_${uid}` : `${baseKey}_anon`;
      return localStorage.setItem(key, value);
    },
    removeItem: (name: string) => {
      const uid = getCurrentUserId();
      const key = uid ? `${baseKey}_user_${uid}` : `${baseKey}_anon`;
      return localStorage.removeItem(key);
    },
  } as Storage;
}