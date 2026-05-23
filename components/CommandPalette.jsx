"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, FileUp, MessageSquare, Languages, ClipboardCheck, Clock, Settings } from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = [
    { title: "Dashboard Overview", path: "/dashboard", icon: Sparkles },
    { title: "Upload Documents", path: "/dashboard/upload", icon: FileUp },
    { title: "AI Assistant Bot", path: "/dashboard/chat", icon: MessageSquare },
    { title: "Translation Simplifier", path: "/dashboard/translate", icon: Languages },
    { title: "Eligibility Finder", path: "/dashboard/eligibility", icon: ClipboardCheck },
    { title: "Application Tracker", path: "/dashboard/tracker", icon: Clock },
    { title: "Settings Config", path: "/dashboard/settings", icon: Settings },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (path) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400 text-sm"
          />
          <kbd className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-400 font-sans">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching pages found.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Pages & Commands
              </span>
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.path}
                    onClick={() => navigateTo(cmd.path)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1a56db] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#1a56db]" />
                    <span>{cmd.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

