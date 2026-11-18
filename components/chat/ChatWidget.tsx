"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Sparkles, User,
  Loader2, ChevronDown, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatApi, ChatMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const SUGGESTED = [
  { label: "Check my balance",        icon: "💰" },
  { label: "How do I send money?",    icon: "💸" },
  { label: "Reset my payment PIN",    icon: "🔐" },
  { label: "I didn't receive my OTP", icon: "📧" },
  { label: "Transfer limits",         icon: "📊" },
  { label: "Contact support",         icon: "🎧" },
];

export default function ChatWidget() {
  const { user } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  const historyRef = useRef<ChatMessage[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");

    const userMsg: DisplayMessage = {
      id:        crypto.randomUUID(),
      role:      "user",
      text:      trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res   = await chatApi.send(trimmed, historyRef.current);
      const reply = res.data.reply;

      historyRef.current = [
        ...historyRef.current,
        { role: "user",      content: trimmed },
        { role: "assistant", content: reply   },
      ];
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
      const errMsg = err instanceof Error ? err.message : "";
      const isHighDemand = errMsg.includes("high demand") || errMsg.includes("busy");
      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      "assistant",
        text:      isHighDemand
          ? "I'm a little busy right now — please try again in a moment."
          : "I'm having trouble connecting. Please try again or email us at evergreenworldbank@gmail.com.",
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── Full-screen overlay ───────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-dark-bg animate-fade-in">

          {/* ── Top bar ──────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-dark-border bg-dark-card">
            <div className="flex items-center gap-3">
              {/* Aria avatar */}
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-dark-card" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-none">Aria</h2>
                <p className="text-xs text-slate-400 mt-0.5">Evergreen AI Assistant · Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clear chat */}
              {hasMessages && (
                <button
                  onClick={() => { setMessages([]); historyRef.current = []; }}
                  className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-dark-muted transition-colors"
                >
                  Clear chat
                </button>
              )}
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Message area ─────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

              {/* Welcome block — shown when no messages yet */}
              {!hasMessages && (
                <div className="text-center space-y-4 pt-6">
                  <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center shadow-xl mx-auto">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Hello, {firstName}! 👋
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                      I'm Aria, your personal banking assistant. I can help you with
                      account questions, transfers, and more.
                    </p>
                  </div>

                  {/* Suggestion grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto pt-2">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => sendMessage(s.label)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-dark-border bg-dark-card hover:border-primary-500 hover:bg-primary-500/5 text-left transition-all group"
                      >
                        <span className="text-lg flex-shrink-0">{s.icon}</span>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white leading-snug">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-2xl flex items-center justify-center text-white text-xs font-bold mt-1",
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-primary-500 to-primary-700"
                      : "bg-slate-700"
                  )}>
                    {msg.role === "assistant"
                      ? <Sparkles className="h-3.5 w-3.5" />
                      : <User className="h-3.5 w-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "max-w-[75%] sm:max-w-[65%] space-y-1",
                    msg.role === "user" ? "items-end" : "items-start",
                    "flex flex-col"
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-dark-card border border-dark-border text-slate-200 rounded-tl-sm"
                        : "bg-primary-600 text-white rounded-tr-sm"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-1",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}>
                      <Clock className="h-3 w-3 text-slate-600" />
                      <span className="text-[10px] text-slate-600">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-dark-card border border-dark-border rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.18}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Post-message suggestions */}
              {hasMessages && !loading && messages[messages.length - 1].role === "assistant" && (
                <div className="flex flex-wrap gap-2 pl-11">
                  {["Something else", "Transfer money", "Contact support"].map(s => (
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

              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Scroll to bottom hint ─────────────────────────────────────── */}
          {hasMessages && (
            <button
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="absolute bottom-24 right-6 h-8 w-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {/* ── Input bar ────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-dark-border bg-dark-card px-4 sm:px-6 py-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-dark-bg border border-dark-border rounded-2xl px-4 py-3 focus-within:border-primary-500 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Aria anything about your account…"
                  disabled={loading}
                  maxLength={1000}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 max-h-32 leading-relaxed"
                  style={{ minHeight: "24px" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Send"
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                    : <Send className="h-4 w-4 text-white" />}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-2">
                Aria can make mistakes. For urgent issues, email{" "}
                <a href="https://mail.google.com/mail/?view=cm&to=evergreenworldbank@gmail.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                  evergreenworldbank@gmail.com
                </a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating trigger ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 bg-primary-600 hover:bg-primary-700 hover:scale-105 shadow-primary-700/40"
        aria-label="Open Aria AI Assistant"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
            {/* Chat bubble body */}
            <path
              d="M6 8C6 5.79 7.79 4 10 4H26C28.21 4 30 5.79 30 8V21C30 23.21 28.21 25 26 25H14L8 31V25H10C7.79 25 6 23.21 6 21V8Z"
              fill="white"
            />
            {/* Three dots inside bubble */}
            <circle cx="13" cy="14.5" r="2" fill="#2563eb" />
            <circle cx="18" cy="14.5" r="2" fill="#2563eb" />
            <circle cx="23" cy="14.5" r="2" fill="#2563eb" />
          </svg>
        )}
      </button>
    </>
  );
}
