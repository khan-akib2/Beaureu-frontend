"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  Send, Sparkles, User, HelpCircle, Plus, Loader2, Shield,
  Trash2, MessageSquare, Paperclip, Mic, MicOff, Volume2, VolumeX, FileText, X,
  Copy, Check
} from "lucide-react";
import { useUser } from "../layout";
import { TRANSLATIONS } from "../../../lib/translations";

const API = process.env.NEXT_PUBLIC_API_URL;

const WELCOME_MESSAGES = {
  en: "Namaste! I am **BureauAI**, your Indian Government Process Assistant.\n\nAsk me how to apply for schemes, update cards (like Aadhaar/PAN), simplify government notices, or what documents you need to visit a Tahsildar office. How can I guide you today?",
  hi: "नमस्ते! मैं **BureauAI** हूँ, आपका भारतीय सरकारी प्रक्रिया सहायक।\n\nमुझसे पूछें कि योजनाओं के लिए कैसे आवेदन करें, कार्ड (जैसे आधार/पैन) कैसे अपडेट करें, सरकारी सूचनाओं को कैसे सरल बनाएं, या तहसीलदार कार्यालय जाने के लिए आपको किन दस्तावेजों की आवश्यकता है। आज मैं आपका मार्गदर्शन कैसे कर सकता हूँ?",
  mr: "नमस्कार! मी **BureauAI** आहे, आपला भारतीय सरकारी प्रक्रिया सहाय्यक.\n\nयोजनांसाठी अर्ज कसा करावा, कार्डे (उदा. आधार/पैन) कशी अपडेट करावी, सरकारी सूचना कशा सोप्या कराव्यात किंवा तहसीलदार कार्यालयाला भेट देण्यासाठी कोणत्या कागदपत्रांची आवश्यकता आहे याबद्दल मला विचारा. आज मी तुम्हाला कसे मार्गदर्शन करू शकेन?",
  bn: "নমস্কার! আমি **BureauAI**, আপনার ভারতীয় সরকারি প্রক্রিয়া সহকারী।\n\nস্কিমগুলির জন্য কীভাবে আবেদন করতে হয়, কার্ডগুলি (যেমন আধার/প্যান) কীভাবে আপডেট করতে হয়, সরকারি নোটিশগুলি কীভাবে সহজ করতে হয় বা তহশিলদার অফিসে যাওয়ার জন্য আপনার কী কী নথিপত্র প্রয়োজন তা আমাকে জিজ্ঞাসা করুন। আজ আমি আপনাকে কীভাবে গাইড করতে পারি?",
  ur: "नमस्ते! میں **BureauAI** ہوں، آپ کا ہندوستانی سرکار کے عمل کا مددگار۔\n\nمجھ سے پوچھیں کہ اسکیموں کے لیے کیسے اپلائی کریں، کارڈز (جیسے آدھار/پین) کیسے اپ ڈیٹ کریں، سرکاری نوٹس کو کیسے آسان بنائیں، یا تحصیلدار آفس جانے کے لیے آپ کو کن دستاویزات کی ضرورت ہے۔ آج میں آپ کی رہنمائی کیسے کر سکتا ہوں؟"
};

const SAMPLE_PROMPTS = {
  en: [
    { text: "How to update address in Aadhaar card?", label: "Aadhaar Update" },
    { text: "What are the documents needed for an Income Certificate?", label: "Income Cert" },
    { text: "Process to apply for a physical PAN Card online", label: "PAN Card" },
    { text: "Am I eligible for Post Matric Scholarship?", label: "Scholarships" },
  ],
  hi: [
    { text: "आधार कार्ड में पता कैसे अपडेट करें?", label: "आधार अपडेट" },
    { text: "आय प्रमाण पत्र के लिए किन दस्तावेजों की आवश्यकता है?", label: "आय प्रमाण पत्र" },
    { text: "भौतिक पैन कार्ड के लिए ऑनलाइन आवेदन करने की प्रक्रिया", label: "पैन कार्ड" },
    { text: "क्या मैं पोस्ट मैट्रिक छात्रवृत्ति के लिए पात्र हूँ?", label: "छात्रवृत्ति" },
  ],
  mr: [
    { text: "आधार कार्डमध्ये पत्ता कसा अपडेट करायचा?", label: "आधार अपडेट" },
    { text: "उत्पन्नाच्या दाखल्यासाठी कोणती कागदपत्रे आवश्यक आहेत?", label: "उत्पन्नाचा दाखला" },
    { text: "ऑनलाइन भौतिक पॅन कार्डसाठी अर्ज करण्याची प्रक्रिया", label: "पॅन कार्ड" },
    { text: "मी पोस्ट मॅट्रिक शिष्यवृत्तीसाठी पात्र आहे का?", label: "शिष्यवृत्ती" },
  ],
  bn: [
    { text: "আধার কার্ডে ঠিকানা কীভাবে আপডেট করবেন?", label: "আধার আপডেট" },
    { text: "আয় শংসাপত্রের জন্য কী কী নথি প্রয়োজন?", label: "আয় শংসাপত্র" },
    { text: "অনলাইনে ফিজিক্যাল প্যান কার্ডের জন্য আবেদন করার পদ্ধতি", label: "প্যান কার্ড" },
    { text: "আমি কি পোস্ট ম্যাট্রিক স্কলারশিপের জন্য যোগ্য?", label: "স্কলারশিপ" },
  ],
  ur: [
    { text: "آدھار کارڈ میں پتہ کیسے اپ ڈیٹ کریں؟", label: "آدھار اپ ڈیٹ" },
    { text: "انکم سرٹیفکیٹ کے لیے کن دستاویزات کی ضرورت ہے؟", label: "انکم سرٹیفکیٹ" },
    { text: "آن لائن فزیکل پین کارڈ کے لیے اپلائی کرنے کا طریقہ کار", label: "پین کارڈ" },
    { text: "کیا میں پوسٹ میٹرک اسکالرشپ کے لیے اہل ہوں؟", label: "اسکالرشپ" },
  ]
};

function isImageFile(msg) {
  if (!msg) return false;
  if (msg.fileType && msg.fileType.startsWith("image/")) return true;
  if (msg.fileName && /\.(png|jpg|jpeg|webp|gif)$/i.test(msg.fileName)) return true;
  if (msg.fileUrl && /\.(png|jpg|jpeg|webp|gif)/i.test(msg.fileUrl)) return true;
  return false;
}

// Line-by-line renderer for markdown lists and headings without needing double newlines
function MessageContent({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }

  const flushList = (key) => {
    if (currentList) {
      const ListTag = currentList.type;
      elements.push(
        <ListTag key={`list-${key}`} className={`space-y-1 my-2 ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-5`}>
          {currentList.items.map((item, idx) => (
            <li key={idx} className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {renderBold(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(i);
      // Small visual paragraph spacing
      elements.push(<div key={`space-${i}`} className="h-1" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList(i);
      elements.push(
        <h4 key={i} className="text-xs font-bold text-slate-900 mt-3 mb-1">
          {renderBold(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(i);
      elements.push(
        <h3 key={i} className="text-sm font-extrabold text-slate-900 mt-3 mb-1">
          {renderBold(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList(i);
      elements.push(
        <h2 key={i} className="text-base font-black text-slate-900 mt-4 mb-2">
          {renderBold(trimmed.slice(2))}
        </h2>
      );
    }
    // Bullet lists (* or -)
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const text = trimmed.slice(2);
      if (currentList && currentList.type === "ul") {
        currentList.items.push(text);
      } else {
        flushList(i);
        currentList = { type: "ul", items: [text] };
      }
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s/);
      const text = trimmed.slice(match[0].length);
      if (currentList && currentList.type === "ol") {
        currentList.items.push(text);
      } else {
        flushList(i);
        currentList = { type: "ol", items: [text] };
      }
    }
    // Regular plain text line
    else {
      flushList(i);
      elements.push(
        <p key={i} className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-1">
          {renderBold(line)}
        </p>
      );
    }
  }
  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

function renderBold(text) {
  return text.split("**").map((chunk, i) =>
    i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{chunk}</strong> : chunk
  );
}

export default function ChatPage() {
  const { language } = useUser();
  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;

  const welcomeMsg = {
    role: "model",
    content: WELCOME_MESSAGES[language] || WELCOME_MESSAGES["en"],
    timestamp: new Date().toISOString()
  };

  const [sessions, setSessions] = useState([{ id: "default", title: t("new_chat") }]);
  const [activeSession, setActiveSession] = useState("default");
  // Map of sessionId → messages[]
  const [sessionMessages, setSessionMessages] = useState({ default: [welcomeMsg] });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // File upload state
  const [attachedFile, setAttachedFile] = useState(null); // { fileUrl, fileName, fileType }
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Speech synthesis speaking state
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  
  // Clipboard copying state
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const messages = sessionMessages[activeSession] || [welcomeMsg];

  // Set up Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setInput((prev) => (prev ? prev + " " + transcript : transcript));
        };
        rec.onerror = (e) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Sync welcome message on language switch if no messages exist in default
  useEffect(() => {
    setSessionMessages((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((sessId) => {
        if (copy[sessId].length === 1 && copy[sessId][0].role === "model") {
          copy[sessId] = [{
            role: "model",
            content: WELCOME_MESSAGES[language] || WELCOME_MESSAGES["en"],
            timestamp: copy[sessId][0].timestamp
          }];
        }
      });
      return copy;
    });

    setSessions((prev) =>
      prev.map((s) => s.id === "default" || s.title === "New Conversation" || s.title === "নতুন চ্যাট" || s.title === "नई चैट" ? { ...s, title: t("new_chat") } : s)
    );
  }, [language]);

  // Load list of sessions from backend on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch(`${API}/api/ai/chat`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.sessions?.length > 0) {
            const loaded = data.sessions.map((s) => ({ id: s._id, title: s.title }));
            setSessions(loaded);
            setActiveSession(loaded[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setInitLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Fetch full messages when active session changes
  useEffect(() => {
    if (!activeSession || activeSession === "default") {
      return;
    }
    
    // Fetch if we don't have the full session message list populated yet
    if (sessionMessages[activeSession] && sessionMessages[activeSession].length > 1) {
      return;
    }

    async function loadMessages() {
      try {
        const res = await fetch(`${API}/api/ai/chat/${activeSession}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setSessionMessages((prev) => ({
              ...prev,
              [activeSession]: data.messages.length > 0 ? data.messages : [welcomeMsg]
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load messages for session:", activeSession, err);
      }
    }
    loadMessages();
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSession]);

  // Toggle Speech-to-Text Listening
  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const localeMap = {
        en: "en-IN",
        hi: "hi-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        ur: "ur-PK"
      };
      recognitionRef.current.lang = localeMap[language] || "en-IN";
      recognitionRef.current.start();
    }
  };

  // Text-to-Speech speaking synthesis
  const speakText = (text, msgId) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[\*#_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const localeMap = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      ur: "ur-PK"
    };
    utterance.lang = localeMap[language] || "en-IN";
    
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(utterance.lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };
  
  // Clipboard copy helper
  const copyText = (text, msgId) => {
    if (typeof window === "undefined" || !navigator.clipboard) {
      alert("Clipboard copy is not supported in this browser.");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch((err) => {
      console.error("Failed to copy text:", err);
    });
  };

  // Handle uploading documents or images in the chat via Paperclip
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/api/documents`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setAttachedFile({
          fileUrl: data.document.fileUrl,
          fileName: data.document.fileName,
          fileType: data.document.fileType
        });
      } else {
        alert(data.error || "Failed to upload attachment file.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Attachment upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const res = await fetch(`${API}/api/ai/chat/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t("new_chat") }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          const id = data.session._id;
          setSessions((prev) => [{ id, title: data.session.title }, ...prev]);
          setSessionMessages((prev) => ({ ...prev, [id]: [welcomeMsg] }));
          setActiveSession(id);
          setInput("");
          setTimeout(() => inputRef.current?.focus(), 50);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to create new session:", err);
    }

    // Fallback to local
    const id = `session_${Date.now()}`;
    setSessions((prev) => [{ id, title: t("new_chat") }, ...prev]);
    setSessionMessages((prev) => ({ ...prev, [id]: [welcomeMsg] }));
    setActiveSession(id);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDeleteSession = async (id) => {
    try {
      await fetch(`${API}/api/ai/chat/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
    } catch (err) {
      console.error("Failed to delete session on server:", err);
    }
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewSession();
      return;
    }
    setSessions(remaining);
    setSessionMessages((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (activeSession === id) setActiveSession(remaining[0].id);
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if ((!text && !attachedFile) || loading) return;
    setInput("");
    
    // Store reference to attached file before clearing
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    let currentSessionId = activeSession;
    
    // Auto-create backend session if on default template
    if (activeSession === "default") {
      try {
        const titleText = text ? text.slice(0, 30) : currentAttachment?.fileName || "Document Query";
        const newSessionRes = await fetch(`${API}/api/ai/chat/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleText }),
          credentials: "include"
        });
        if (newSessionRes.ok) {
          const data = await newSessionRes.json();
          if (data.session) {
            currentSessionId = data.session._id;
            setSessions((prev) => {
              const filtered = prev.filter((s) => s.id !== "default");
              return [{ id: currentSessionId, title: titleText }, ...filtered];
            });
            setActiveSession(currentSessionId);
          }
        }
      } catch (err) {
        console.error("Failed to auto-create session:", err);
      }
    }

    const userMsg = {
      role: "user",
      content: text || `[Uploaded file: ${currentAttachment.fileName}]`,
      timestamp: new Date().toISOString(),
      ...(currentAttachment ? {
        fileUrl: currentAttachment.fileUrl,
        fileName: currentAttachment.fileName,
        fileType: currentAttachment.fileType
      } : {})
    };

    const activeMsgs = sessionMessages[currentSessionId] || [welcomeMsg];
    const currentMsgs = [...activeMsgs, userMsg];

    // Update title locally if needed
    if (activeMsgs.filter((m) => m.role === "user").length === 0) {
      const newTitle = text ? text.slice(0, 40) : currentAttachment?.fileName.slice(0, 40);
      setSessions((prev) =>
        prev.map((s) => s.id === currentSessionId ? { ...s, title: newTitle } : s)
      );
    }

    setSessionMessages((prev) => ({ ...prev, [currentSessionId]: currentMsgs }));
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/chat/${currentSessionId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMsgs.filter((m) => m.role !== "model" || m.content !== welcomeMsg.content).map(m => ({
            role: m.role,
            content: m.content,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            fileType: m.fileType
          })),
          message: text || `Please analyze this document: ${currentAttachment.fileName}`,
          fileUrl: currentAttachment?.fileUrl,
          fileName: currentAttachment?.fileName,
          fileType: currentAttachment?.fileType,
          language: language || "en"
        }),
      });

      const data = await res.json();
      const reply = res.ok
        ? data.response
        : "Sorry, I encountered an error. Please try again.";

      setSessionMessages((prev) => ({
        ...prev,
        [currentSessionId]: [
          ...currentMsgs,
          { role: "model", content: reply, timestamp: new Date().toISOString() },
        ],
      }));

      if (res.ok && data.title) {
        setSessions((prev) =>
          prev.map((s) => s.id === currentSessionId ? { ...s, title: data.title } : s)
        );
      }
    } catch {
      setSessionMessages((prev) => ({
        ...prev,
        [currentSessionId]: [
          ...currentMsgs,
          { role: "model", content: "Connection failed. Please check your server status.", timestamp: new Date().toISOString() },
        ],
      }));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const samplePromptsList = SAMPLE_PROMPTS[language] || SAMPLE_PROMPTS["en"];

  return (
    <div className="flex flex-col md:flex-row gap-5 animate-fade-in font-sans" style={{ height: "calc(100vh - 7rem)" }}>

      {/* ── Left sidebar ── */}
      <div className="w-full md:w-60 shrink-0 flex flex-col bg-white border border-slate-200 rounded-3xl p-4 overflow-hidden shadow-sm">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> {t("new_chat")}
        </button>

        <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
            {t("past_conversations")}
          </span>
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
                title={t("delete_chat")}
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
              {t("chat_title")} <Sparkles className="w-4 h-4 text-[#1a56db]" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {t("chat_subtitle")}
            </p>
          </div>
          <Badge variant="success" className="text-[9px] font-bold px-2 py-0.5">
            {t("chat_active")}
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0 bg-slate-50/10">
          {initLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-7 h-7 text-[#1a56db] animate-spin" />
              <span className="text-xs text-slate-400 font-medium">{t("loading")}</span>
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
                    {/* Render attachment bubble inside the message context */}
                    {msg.fileUrl && (
                      <div className={`mb-2.5 p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                        isModel ? "bg-white border-slate-200 text-slate-700" : "bg-blue-700/50 border-blue-500/50 text-white"
                      }`}>
                        {isImageFile(msg) ? (
                          <img src={msg.fileUrl} alt={msg.fileName} className="w-10 h-10 object-cover rounded-lg border border-slate-200/20" />
                        ) : (
                          <FileText className="w-5 h-5 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-xs">{msg.fileName || "Document File"}</p>
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`text-[10px] font-bold underline ${
                            isModel ? "text-[#1a56db] hover:text-blue-800" : "text-blue-200 hover:text-blue-100"
                          }`}>
                            View Attachment
                          </a>
                        </div>
                      </div>
                    )}

                    {isModel ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed font-medium">{msg.content}</p>
                    )}

                    {msg.timestamp && (
                      <div className="flex items-center gap-2.5 mt-2">
                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => copyText(msg.content, i)}
                          className={`p-1 rounded transition-colors flex items-center gap-1 text-[9px] font-bold ${
                            isModel
                              ? "hover:bg-slate-200/50 text-slate-400 hover:text-[#1a56db]"
                              : "hover:bg-blue-700/50 text-blue-200 hover:text-white"
                          }`}
                          title="Copy message to clipboard"
                        >
                          {copiedMessageId === i ? (
                            <>
                              <Check className="w-3 h-3 text-green-500 shrink-0" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 shrink-0" />
                              Copy
                            </>
                          )}
                        </button>

                        {/* Speak Button (Model only) */}
                        {isModel && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.content, i)}
                            className="p-1 rounded hover:bg-slate-200/50 text-slate-400 hover:text-[#1a56db] transition-colors flex items-center gap-1 text-[9px] font-bold"
                            title="Speak response aloud"
                          >
                            {speakingMessageId === i ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-[#1a56db]" />
                                Speak
                              </>
                            )}
                          </button>
                        )}
                        
                        <span className={`text-[9px] ml-auto block text-right ${isModel ? "text-slate-400" : "text-blue-200"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
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

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
          {/* File upload preview card */}
          {(uploadingFile || attachedFile) && (
            <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                {uploadingFile ? (
                  <Loader2 className="w-5 h-5 text-[#1a56db] animate-spin flex-shrink-0" />
                ) : isImageFile(attachedFile) ? (
                  <img src={attachedFile.fileUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {uploadingFile ? "Uploading document to cloud..." : attachedFile.fileName}
                  </p>
                  {!uploadingFile && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ready to send</span>}
                </div>
              </div>
              {!uploadingFile && (
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
            
            <button
              type="button"
              disabled={uploadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-[#1a56db] transition-all flex-shrink-0"
              title="Attach document or image"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={toggleListen}
              className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                isListening
                  ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                  : "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-[#1a56db]"
              }`}
              title="Voice Speech to Text input"
            >
              {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || uploadingFile}
                placeholder={t("ask_question_placeholder")}
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100/50 text-xs sm:text-sm transition-all"
              />
              <button
                type="submit"
                disabled={loading || uploadingFile || (!input.trim() && !attachedFile)}
                className="absolute right-2 top-1.5 p-2 rounded-xl bg-[#1a56db] hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right helper panel ── */}
      <div className="hidden xl:flex w-64 shrink-0 h-full">
        <Card className="bg-white w-full h-full flex flex-col border border-slate-200 rounded-3xl overflow-hidden shadow-sm" hover={false}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <HelpCircle className="w-4 h-4 text-[#1a56db]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {t("helper_topics")}
            </span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t("suggested_questions")}
            </span>
            {samplePromptsList.map((p, i) => (
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
            <strong>{t("chat_tip").split(":")[0]}:</strong>{t("chat_tip").split(":")[1]}
          </div>
        </Card>
      </div>

    </div>
  );
}
