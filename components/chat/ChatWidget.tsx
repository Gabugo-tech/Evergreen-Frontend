"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatApi, ChatMessage } from "@/lib/api";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const SUGGESTED = [
  "What's my account balance?",
  "How do I send money?",
  "How do I reset my PIN?",
  "What are your transfer limits?",
];

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id:        "welcome",
      role:      "assistant",
      text:      "Hi! I'm Aria, your Evergreen assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  // Gemini conversation history (separate from display messages)
  const historyRef = useRef<ChatMessage[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");

    // Add user message to display
    const userMsg: DisplayMessage = {
      id:        crypto.randomUUID(),
      role:      "user",
      text:      trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.send(trimmed, historyRef.current);
      const reply = res.data.reply;

      // Update Gemini history
      historyRef.current = [
        ...historyRef.current,
        { role: "user",  parts: [{ text: trimmed }] },
        { role: "model", parts: [{ text: reply    }] },
      ];
      // Keep history bounded to last 20 turns (10 exchanges)
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }

      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      "assistant",
        text:      reply,
        timestamp: new Date(),
      }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      // Show a clean message — strip raw JSON error objects
      const isHighDemand = errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE");
      const displayMsg = isHighDemand
        ? "Aria is experiencing high demand right now. Please try again in a moment."
        : "Sorry, I'm having trouble connecting. Please try again or contact support at evergreenworldbank@gmail.com.";
      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      "assistant",
        text:      displayMsg,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl border border-dark-border bg-dark-card shadow-2xl overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-600 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Aria</p>
                <p className="text-xs text-primary-200 mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                  Evergreen Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              aria-label="Close chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[360px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5",
                  msg.role === "assistant"
                    ? "bg-primary-600"
                    : "bg-slate-600"
                )}>
                  {msg.role === "assistant"
                    ? <Bot className="h-3.5 w-3.5" />
                    : <User className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-dark-muted text-slate-200 rounded-tl-sm"
                    : "bg-primary-600 text-white rounded-tr-sm"
                )}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    msg.role === "assistant" ? "text-slate-500" : "text-primary-200"
                  )}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-dark-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show when just welcome message */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-dark-border text-slate-400 hover:text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t border-dark-border bg-dark-muted/30 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Aria anything…"
              disabled={loading}
              maxLength={1000}
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              {loading
                ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                : <Send className="h-4 w-4 text-white" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          open
            ? "bg-slate-700 hover:bg-slate-600 rotate-0"
            : "bg-primary-600 hover:bg-primary-700 shadow-primary-600/30"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open
          ? <X className="h-6 w-6 text-white" />
          : <MessageCircle className="h-6 w-6 text-white" />}
      </button>
    </>
  );
}
