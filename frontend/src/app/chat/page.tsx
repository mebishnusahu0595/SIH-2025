"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, RefreshCw, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      const response = await fetch('http://localhost:8000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
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
      addMessage("I'm having trouble connecting right now. Please try again.", "bot");
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
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.start();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {showCrisisAlert && (
        <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
      )}
      
      {/* Safety Notice */}
      <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Anonymous Support Chat</p>
              <p>
                I'm here to provide supportive conversation and evidence-based coping tips. 
                This service is not a substitute for professional medical care. 
                If you're in crisis, please reach out to emergency services or call 988.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="text-center text-gray-500 mt-8">
            <p>Hello! I'm here to listen and support you.</p>
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
        <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-3">
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
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  );
}