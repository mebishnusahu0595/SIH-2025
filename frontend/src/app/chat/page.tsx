"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, RefreshCw, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrisisAlert } from "@/components/CrisisAlert";
import { useChatStore } from "@/stores/chatStore";
import { formatTime } from "@/lib/utils";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isTyping,
    isVoiceEnabled,
    crisisDetected,
    sessionId,
    addMessage,
    setTyping,
    toggleVoice,
    clearChat,
    setCrisisDetected,
  } = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (crisisDetected) {
      setShowCrisisAlert(true);
    }
  }, [crisisDetected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    addMessage(userMessage, "user");
    setTyping(true);

    try {
      // Real API call to backend
  const { getCurrentUserId } = await import('@/lib/utils');
  const { API_ENDPOINTS } = await import('@/lib/constants');
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';
  const chatEndpoint = `${apiBase}${API_ENDPOINTS.chat}/message`;
      const uid = getCurrentUserId();

  const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'X-User-ID': uid || '',
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      addMessage(data.ai_message.content, "bot");
      
      // Handle crisis detection
      if (data.crisis_detected) {
        setCrisisDetected(true);
      }
      
    } catch (error) {
      console.error('API Error:', error);
      addMessage("I&apos;m having trouble connecting right now. Please try again.", "bot");
    } finally {
      setTyping(false);
    }
  };

  const startVoiceRecording = () => {
    if (!isVoiceEnabled) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.start();
    }
  };

  return (
    <div className={`w-full bg-white text-black overflow-x-hidden min-h-screen flex flex-col pt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-8`}>
      {showCrisisAlert && (
        <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
      )}
      
      {/* Safety Notice */}
      <div className="mb-4 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-900 mt-1" />
          <div className="text-sm pt-0.5">
            <p className="font-medium mb-2">Anonymous Support Chat</p>
            <p className="leading-relaxed">
              I&apos;m here to provide supportive conversation and evidence-based coping tips. 
              This service is not a substitute for professional medical care. 
              If you're in crisis, please reach out to emergency services or call 988.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Supportive Chat</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleVoice}
            variant="outline"
            size="sm"
            className={isVoiceEnabled ? "bg-blue-50 border-blue-500" : ""}
          >
            {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button onClick={clearChat} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-white mt-8">
            <p>Hello! I&apos;m here to listen and support you.</p>
            <p>How are you feeling today?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : message.type === "crisis_alert"
                  ? "bg-red-100 border border-red-300 text-red-800"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
                <span className="text-sm text-gray-500 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Crisis Banner */}
      {crisisDetected && !showCrisisAlert && (
        <div className="mb-4 border-red-500 bg-red-50 dark:bg-red-950 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">Crisis support available 24/7</span>
            </div>
            <Button
              onClick={() => setShowCrisisAlert(true)}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Get Help Now
            </Button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isTyping}
            className="w-full"
          />
        </div>
        {isVoiceEnabled && (
          <Button
            type="button"
            onClick={startVoiceRecording}
            variant="outline"
            disabled={isListening || isTyping}
            className={isListening ? "bg-red-50 border-red-500" : ""}
          >
            <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
          </Button>
        )}
        <Button type="submit" disabled={!input.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

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
  );
}
