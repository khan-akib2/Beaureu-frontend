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
  Shield
} from "lucide-react";

export default function ChatPage() {
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

  // Sync historical messages from database
  useEffect(() => {
    async function loadChatHistory() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            // Seed a welcome message if history is empty
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
        console.error("Error loading chat history:", err);
      } finally {
        setInitLoading(false);
      }
    }
    loadChatHistory();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput("");

    // Append user message
    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, { credentials: "include", 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [...messages, userMessage],
          message: text
        })
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
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "Sorry, I encountered an error connecting to the AI brain. Please check your credentials.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Connection failed. Please check if your server is running.",
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

  // Convert simple markdown strings into HTML paragraphs/bullets
  const renderMessageContent = (content) => {
    return content.split("\n\n").map((paragraph, index) => {
      // Check if item is a list
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

      // Check header formatting
      if (paragraph.startsWith("### ")) {
        return <h4 key={index} className="text-xs font-bold text-slate-900 mt-3.5 mb-1.5">{paragraph.replace("### ", "")}</h4>;
      }
      
      if (paragraph.startsWith("## ")) {
        return <h3 key={index} className="text-sm font-extrabold text-slate-900 mt-4 mb-1.5">{paragraph.replace("## ", "")}</h3>;
      }

      // Default paragraph bold parsing
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
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-screen relative animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            AI Assistant Copilot <Badge variant="info">Active Agent</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Inquire in English, Hindi (हिंदी), Marathi (मराठी) or Urdu (اردو).</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-white"
          onClick={() => {
            setMessages([
              {
                role: "model",
                content: "Conversation logs cleared. Ask me any new government procedure question!",
                timestamp: new Date().toISOString()
              }
            ]);
          }}
        >
          <Plus className="w-4 h-4" /> Clear Logs
        </Button>
      </div>

      <div className="flex-1 flex gap-8 py-6 min-h-0">
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Messages scroll box */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {initLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
                <span className="text-xs text-slate-400">Syncing conversation archive...</span>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isModel = msg.role === "model";
                return (
                  <div 
                    key={index}
                    className={`flex gap-4 ${isModel ? "justify-start" : "justify-end"}`}
                  >
                    {isModel && (
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isModel 
                          ? "bg-white border border-slate-200 text-slate-700 shadow-sm"
                          : "bg-[#1a56db] text-white font-medium"
                      }`}
                    >
                      {isModel ? (
                        <div className="space-y-1">
                          {renderMessageContent(msg.content)}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm">{msg.content}</p>
                      )}
                      
                      <span className={`text-[9px] block mt-2 text-right ${isModel ? "text-slate-400" : "text-blue-200"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!isModel && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
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
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing input panel */}
          <div className="pt-4 flex-shrink-0 bg-transparent">
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
                disabled={loading}
                className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white transition-all outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right side suggestions panel (Desktop only) */}
        <div className="hidden xl:block w-72 flex-shrink-0">
          <Card className="bg-white h-full flex flex-col justify-between" hover={false}>
            <div className="p-5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
              <HelpCircle className="w-4 h-4 text-[#1a56db]" />
              <span>Helper Topics</span>
            </div>
            
            <div className="flex-1 p-5 space-y-3 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt.text)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-[#1a56db]/20 bg-slate-50 hover:bg-blue-50 text-xs text-slate-600 transition-all font-medium"
                >
                  <span className="font-bold text-[#1a56db] block mb-1">{prompt.label}</span>
                  {prompt.text}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] leading-relaxed text-slate-500 rounded-b-2xl">
              <strong>Tip:</strong> BureauAI responds in the matching regional language of your input (English, Hindi, Marathi, or Urdu).
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
