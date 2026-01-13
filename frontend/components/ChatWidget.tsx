"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: number;
  from: "user" | "bot";
  text: string;
  timestamp: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const welcome: ChatMessage = {
      id: Date.now(),
      from: "bot",
      text: "Welcome to Smart Hotel Serena. Ask about bookings, rooms, pricing or staff support & we'll guide you.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([welcome]);
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsReplying(true);

    // Simple simulated assistant reply
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let reply =
        "Thank you for your message. Our virtual concierge has received it and will help you manage bookings, pricing and staff workflows.";

      if (lower.includes("booking") || lower.includes("room")) {
        reply =
          "For bookings: open the Booking Engine in your dashboard to create, move or cancel reservations in real time.";
      } else if (lower.includes("price") || lower.includes("pricing") || lower.includes("rate")) {
        reply =
          "For pricing: go to the Pricing Engine panel where you can apply seasonal rules and dynamic rates.";
      } else if (lower.includes("staff") || lower.includes("housekeeping") || lower.includes("maintenance")) {
        reply =
          "For staff: use the Staff Operations view to assign housekeeping and maintenance tasks live.";
      }

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsReplying(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 shadow-[0_24px_80px_rgba(15,23,42,0.95)] ring-2 ring-white/40 hover:brightness-110 transition-all"
        aria-label="Open live chat"
      >
        <MessageCircle className="h-6 w-6 text-black" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-24 right-6 z-40 w-[320px] sm:w-[360px] rounded-3xl border border-white/15 bg-black/80 backdrop-blur-2xl shadow-[0_30px_100px_rgba(15,23,42,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-400/10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.7)]">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-white tracking-[0.18em] uppercase">
                    Live Concierge
                  </span>
                  <span className="text-[10px] text-emerald-300/90 tracking-[0.18em] uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-3 py-3 space-y-2 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] items-end gap-2 ${
                      m.from === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center border ${
                        m.from === "user"
                          ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                          : "bg-indigo-500/20 border-indigo-400/40 text-indigo-200"
                      }`}
                    >
                      {m.from === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                        m.from === "user"
                          ? "bg-emerald-500/20 text-emerald-50 border border-emerald-400/40"
                          : "bg-slate-900/80 text-slate-100 border border-white/10"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="mt-1 block text-[9px] opacity-60">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isReplying && (
                <div className="flex justify-start mt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    Typing…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-3 py-2 bg-black/70">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about bookings, pricing or staff…"
                  className="flex-1 rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

