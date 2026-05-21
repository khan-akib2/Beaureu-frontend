"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  Send, Sparkles, User, HelpCircle, Plus, Loader2, Shield,
  Trash2, MessageSquare
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const WELCOME = {
  role: "model",
  content: "Namaste! I am **BureauAI**, your Indian Government Process Assistant.\n\nAsk me how to apply for schemes, update cards (like Aadhaar/PAN), simplify government notices, or what documents you need to visit a Tahsildar office. How can I guide you today?",
  timestamp: new Date().toISOString(),
};

const SAMPLE_PROMPTS = [
  { text: "How to update address in Aadhaar card?", label: "Aadhaar Update" },
  { text: "What are the documents needed for an Income Certificate?", label: "Income Cert" },
  { text: "Process to apply for a physical PAN Card online", label: "PAN Card" },
  { text: "Am I eligible for Post Matric Scholarship?", label: "Scholarships" },
];

// Simple markdown renderer
function MessageContent({ content }) {
  const parts = content.split("\n\n");
  return (
    <div className="space-y-1">
      {parts.map((para, i) => {
        if (para.startsWith("### "))
          return <h4 key={i} className="text-xs font-bold text-slate-900 mt-3 mb-1">{para.slice(4)}</h4>;
        if (para.startsWith("## "))
          return <h3 key={i} className="text-sm font-extrabold text-slate-900 mt-3 mb-1">{para.slice(3)}</h3>;
        if (para.match(/^(\*|-|\d+\.)\s/)) {
          return (
            <ul key={i} className="space-y-1 my-2">
              {para.split("\n").map((line, j) => {
                const text = line.replace(/^(\*|-|\d+\.)\s*/, "");
                return (
                  <li key={j} className="ml-4 list-disc pl-1 text-slate-600 text-xs leading-relaxed">
                    {renderBold(text)}
                  </li>
                );
              })}
            </ul>
          );
        }
        return (
          <p key={i} className="text-xs sm:text-sm leading-relaxed text-slate-600">
            {renderBold(para)}
          </p>
        );
      })}
    </div>
  );
}

function renderBold(text) {
  return text.split("**").map((chunk, i) =>
    i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{chunk}</strong> : chunk
  );
}

export default function ChatPage() {
  const [sessions, setSessions] = useState([{ id: "default", title: "New Conversation" }]);
  const [activeSession, setActiveSession] = useState("default");
  // Map of sessionId → messages[]
  const [sessionMessages, setSessionMessages] = useState({ default: [WELCOME] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const messages = sessionMessages[activeSession] || [WELCOME];

  // Load history from backend on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API}/api/ai/chat`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setSessionMessages({ default: data.messages });
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setInitLoading(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input whenever active session changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSession]);

  const handleNewSession = () => {
    const id = `session_${Date.now()}`;
    setSessions((prev) => [{ id, title: "New Conversation" }, ...prev]);
    setSessionMessages((prev) => ({ ...prev, [id]: [WELCOME] }));
    setActiveSession(id);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDeleteSession = (id) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewSession();
      return;
    }
    setSessions(remaining);
    setSessionMessages((prev) => { const n = { ...prev }; delete n[id]; return n; });
    if (activeSession === id) setActiveSession(remaining[0].id);
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
    const currentMsgs = [...(sessionMessages[activeSession] || [WELCOME]), userMsg];

    // Update session title from first user message
    if ((sessionMessages[activeSession] || []).filter((m) => m.role === "user").length === 0) {
      setSessions((prev) =>
        prev.map((s) => s.id === activeSession ? { ...s, title: text.slice(0, 40) } : s)
      );
    }

    setSessionMessages((prev) => ({ ...prev, [activeSession]: currentMsgs }));
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMsgs.filter((m) => m.role !== "model" || m !== WELCOME),
          message: text,
        }),
      });

      const data = await res.json();
      const reply = res.ok
        ? data.response
        : "Sorry, I encountered an error. Please try again.";

      setSessionMessages((prev) => ({
        ...prev,
        [activeSession]: [
          ...currentMsgs,
          { role: "model", content: reply, timestamp: new Date().toISOString() },
        ],
      }));
    } catch {
      setSessionMessages((prev) => ({
        ...prev,
        [activeSession]: [
          ...currentMsgs,
          { role: "model", content: "Connection failed. Please check your server.", timestamp: new Date().toISOString() },
        ],
      }));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 animate-fade-in font-sans" style={{ height: "calc(100vh - 7rem)" }}>

      {/* ── Left sidebar ── */}
      <div className="w-full md:w-60 shrink-0 flex flex-col bg-white border border-slate-200 rounded-3xl p-4 overflow-hidden shadow-sm">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>

        <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">Recent Chats</span>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all border ${
                activeSession === s.id
                  ? "bg-blue-50 border-blue-100 text-blue-800"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSession === s.id ? "text-[#1a56db]" : "text-slate-400"}`} />
                <span className="text-xs font-semibold truncate">{s.title}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main chat ── */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-w-0">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              BureauAI Copilot <Sparkles className="w-4 h-4 text-[#1a56db]" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Ask questions in English, Hindi, Marathi, or Urdu</p>
          </div>
          <Badge variant="success" className="text-[9px] font-bold px-2 py-0.5">Active Session</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {initLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-7 h-7 text-[#1a56db] animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
              <p className="text-xs font-semibold">Start the conversation by typing your query below.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isModel = msg.role === "model";
              return (
                <div key={i} className={`flex gap-3 ${isModel ? "justify-start" : "justify-end"}`}>
                  {isModel && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-[#1a56db] flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isModel
                      ? "bg-slate-50 border border-slate-100 shadow-sm"
                      : "bg-[#1a56db] text-white shadow-sm shadow-blue-500/10"
                  }`}>
                    {isModel
                      ? <MessageContent content={msg.content} />
                      : <p className="text-xs sm:text-sm leading-relaxed font-medium">{msg.content}</p>
                    }
                    {msg.timestamp && (
                      <span className={`text-[9px] block mt-1.5 text-right ${isModel ? "text-slate-400" : "text-blue-200"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  {!isModel && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-[#1a56db] flex items-center justify-center shrink-0 animate-pulse">
                <Shield className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask about application guidelines, documentation checklists, revenue rules..."
              className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100/50 text-xs sm:text-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 rounded-xl bg-[#1a56db] hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Right helper panel ── */}
      <div className="hidden xl:flex w-64 shrink-0 h-full">
        <Card className="bg-white w-full h-full flex flex-col border border-slate-200 rounded-3xl overflow-hidden shadow-sm" hover={false}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <HelpCircle className="w-4 h-4 text-[#1a56db]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Helper Topics</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
            {SAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                disabled={loading}
                className="w-full text-left p-3 rounded-2xl border border-slate-100 hover:border-[#1a56db]/20 bg-slate-50 hover:bg-blue-50 text-xs text-slate-600 transition-all disabled:opacity-50"
              >
                <span className="font-bold text-[#1a56db] block mb-0.5">{p.label}</span>
                {p.text}
              </button>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] leading-relaxed text-slate-500">
            <strong>Tip:</strong> BureauAI responds in the matching regional language of your input (English, Hindi, Marathi, or Urdu).
          </div>
        </Card>
      </div>

    </div>
  );
}
