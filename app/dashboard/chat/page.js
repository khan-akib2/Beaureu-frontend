"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  Send, 
  Sparkles, 
  User, 
  HelpCircle,
  Plus,
  Loader2,
  Shield,
  Trash2,
  MessageSquare
} from "lucide-react";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    { text: "How to update address in Aadhaar card?", label: "Aadhaar Update" },
    { text: "What are the documents needed for an Income Certificate?", label: "Income Cert" },
    { text: "Process to apply for a physical PAN Card online", label: "PAN Card" },
    { text: "Am I eligible for Post Matric Scholarship?", label: "Scholarships" },
  ];

  const loadSessionDetails = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error loading chat details:", err);
    }
  };

  const handleNewChat = async (silent = false) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSessions(prev => [data.session, ...prev]);
          setActiveSessionId(data.session._id);
          setMessages([
            {
              role: "model",
              content: "Namaste! I am **BureauAI**, your Indian Government Process Assistant.\n\nAsk me how to apply for schemes, update cards (like Aadhaar/PAN), simplify government notices, or what documents you need to visit a Tahsildar office. How can I guide you today?",
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to create new chat session:", err);
    }
  };

  const loadSessions = async (selectFirstId = null) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const loadedSessions = data.sessions || [];
        setSessions(loadedSessions);
        
        let targetId = selectFirstId;
        if (!targetId && loadedSessions.length > 0) {
          targetId = loadedSessions[0]._id;
        }

        if (targetId) {
          setActiveSessionId(targetId);
          await loadSessionDetails(targetId);
        } else {
          // If no sessions, create a default one
          await handleNewChat(true);
        }
      }
    } catch (err) {
      console.error("Error loading chat sessions:", err);
    } finally {
      setInitLoading(false);
    }
  };

  // Load chat sessions on mount
  useEffect(() => {
    setTimeout(() => {
      loadSessions();
    }, 0);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteSession = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        const remaining = sessions.filter(s => s._id !== id);
        setSessions(remaining);
        if (activeSessionId === id) {
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0]._id);
            loadSessionDetails(remaining[0]._id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || !activeSessionId) return;

    if (!textToSend) setInput("");

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat/${activeSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: data.response,
            timestamp: new Date().toISOString()
          }
        ]);
        if (data.title) {
          setSessions(prev => prev.map(s => s._id === activeSessionId ? { ...s, title: data.title } : s));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Connection failed. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptText) => {
    handleSendMessage(promptText);
  };

  const renderMessageContent = (content) => {
    return content.split("\n\n").map((paragraph, index) => {
      if (paragraph.startsWith("* ") || paragraph.startsWith("- ") || paragraph.match(/^\d+\./)) {
        const listItems = paragraph.split("\n");
        const listElements = listItems.map((item, itemIdx) => {
          const cleanText = item.replace(/^(\*|-|\d+\.)\s*/, "");
          const boldFormatted = cleanText.split("**").map((textBlock, tIdx) => {
            if (tIdx % 2 === 1) {
              return <strong key={tIdx} className="text-slate-900 font-bold">{textBlock}</strong>;
            }
            return textBlock;
          });
          
          return (
            <li key={itemIdx} className="ml-4 list-disc pl-1 mt-1 text-slate-600">
              {boldFormatted}
            </li>
          );
        });
        return <ul key={index} className="space-y-1 my-2.5">{listElements}</ul>;
      }

      if (paragraph.startsWith("### ")) {
        return <h4 key={index} className="text-xs font-bold text-slate-900 mt-3.5 mb-1.5">{paragraph.replace("### ", "")}</h4>;
      }
      
      if (paragraph.startsWith("## ")) {
        return <h3 key={index} className="text-sm font-extrabold text-slate-900 mt-4 mb-1.5">{paragraph.replace("## ", "")}</h3>;
      }

      const boldFormatted = paragraph.split("**").map((textBlock, tIdx) => {
        if (tIdx % 2 === 1) {
          return <strong key={tIdx} className="text-slate-900 font-bold">{textBlock}</strong>;
        }
        return textBlock;
      });

      return (
        <p key={index} className="leading-relaxed text-slate-600 mt-1.5 text-xs sm:text-sm">
          {boldFormatted}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 h-[calc(100vh-10rem)] max-h-screen relative animate-fade-in font-sans">
      
      {/* Left Sidebar: Session List */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-3xl h-full p-4 overflow-hidden shadow-sm">
        <Button 
          onClick={() => handleNewChat(false)}
          className="w-full justify-center gap-2 bg-[#1a56db] hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-2xl shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </Button>
        
        <div className="flex-1 overflow-y-auto mt-4 space-y-1.5 pr-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">Recent Chats</span>
          {sessions.map(s => (
            <div 
              key={s._id} 
              onClick={() => {
                setActiveSessionId(s._id);
                loadSessionDetails(s._id);
              }}
              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                activeSessionId === s._id 
                  ? "bg-blue-50/50 border-blue-100 text-blue-800 font-bold" 
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === s._id ? "text-[#1a56db]" : "text-slate-400"}`} />
                <span className="text-xs truncate max-w-[130px]">{s.title || "New Conversation"}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(s._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl h-full overflow-hidden shadow-sm relative min-w-0">
        
        {/* Chat top header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              BureauAI Copilot <Sparkles className="w-4 h-4 text-[#1a56db]" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Ask questions in English, Hindi, Marathi, or Urdu</p>
          </div>
          <Badge variant="success" className="text-[9px] font-bold px-2 py-0.5">Active Session</Badge>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
          {initLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Syncing conversation archive...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
              <p className="text-xs font-semibold">Start the conversation by typing your query below.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div 
                  key={index}
                  className={`flex gap-3.5 ${isModel ? "justify-start" : "justify-end"}`}
                >
                  {isModel && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isModel 
                        ? "bg-slate-50 border border-slate-100 text-slate-700 shadow-sm"
                        : "bg-[#1a56db] text-white font-medium shadow-sm shadow-blue-500/10"
                    }`}
                  >
                    {isModel ? (
                      <div className="space-y-1">
                        {renderMessageContent(msg.content)}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                    )}
                    
                    {msg.timestamp && (
                      <span className={`text-[9px] block mt-2 text-right ${isModel ? "text-slate-400" : "text-blue-200"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {!isModel && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Shield className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-100 bg-transparent flex-shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Ask about application guidelines, documentation checklists, revenue rules..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || !activeSessionId}
              className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-blue-100 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !activeSessionId}
              className="absolute right-2 p-2.5 rounded-xl bg-[#1a56db] hover:bg-blue-800 disabled:opacity-50 text-white transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Helper side topics panel (Desktop only) */}
      <div className="hidden xl:block w-72 flex-shrink-0 h-full">
        <Card className="bg-white h-full flex flex-col justify-between border border-slate-200 rounded-3xl overflow-hidden shadow-sm" hover={false}>
          <div className="p-5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide bg-slate-50/50">
            <HelpCircle className="w-4 h-4 text-[#1a56db]" />
            <span>Helper Topics</span>
          </div>
          
          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt.text)}
                disabled={loading || !activeSessionId}
                className="w-full text-left p-3 rounded-2xl border border-slate-100 hover:border-[#1a56db]/20 bg-slate-50/50 hover:bg-blue-50/30 text-xs text-slate-600 transition-all font-medium"
              >
                <span className="font-bold text-[#1a56db] block mb-1">{prompt.label}</span>
                {prompt.text}
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
