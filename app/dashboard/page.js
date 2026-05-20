"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "./layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Folder, Clock, CheckCircle2, AlertCircle, FileText, CreditCard,
  Compass, ArrowRight, Headphones, Sparkles, ChevronRight, Send,
  Loader2, TrendingUp, Shield, Zap, Globe
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardHome() {
  const { user } = useUser();
  const [stats, setStats] = useState({ total: 0, progress: 0, approved: 0, action: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [docsRes, appsRes] = await Promise.all([
          fetch(`${API}/api/documents`, { credentials: "include" }),
          fetch(`${API}/api/applications`, { credentials: "include" })
        ]);
        let apps = [];
        if (appsRes.ok) { const a = await appsRes.json(); apps = a.applications || []; }

        setStats({
          total: apps.length,
          progress: apps.filter(a => ["submitted", "under_review"].includes(a.status)).length,
          approved: apps.filter(a => a.status === "approved").length,
          action: apps.filter(a => a.status === "action_required").length,
        });

        if (apps.length > 0) {
          setRecentApps(apps.slice(0, 4).map(app => ({
            id: app.referenceNumber || `APP${(app._id || "").slice(-8).toUpperCase()}`,
            service: app.title,
            date: new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: { approved: "Approved", rejected: "Rejected", action_required: "Pending", submitted: "Submitted", under_review: "In Review" }[app.status] || "In Progress",
          })));
        }
        setStatsLoaded(true);
      } catch (err) {
        console.error("Stats load error:", err);
        setStatsLoaded(true);
      }
    }
    loadStats();
  }, []);

  const handleAskAI = async (messageText) => {
    const text = messageText || chatInput;
    if (!text.trim()) return;
    setChatLoading(true);
    setChatResponse(null);
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setChatResponse(res.ok ? data.response : "Sorry, I could not process that. Please try again.");
    } catch {
      setChatResponse("Error connecting to AI assistant.");
    } finally {
      setChatLoading(false);
    }
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: Folder, color: "bg-blue-50 text-[#1a56db]", trend: "+2 this week" },
    { label: "In Progress", value: stats.progress, icon: Clock, color: "bg-amber-50 text-amber-600", trend: "Active" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", trend: "Completed" },
    { label: "Pending Action", value: stats.action, icon: AlertCircle, color: "bg-rose-50 text-rose-600", trend: "Needs attention" },
  ];

  const services = [
    { name: "Aadhaar Services", sub: "Update, Download, Verify", icon: Shield, color: "bg-orange-50 border-orange-100 text-orange-600" },
    { name: "PAN Card", sub: "Apply, Link with Aadhaar", icon: CreditCard, color: "bg-blue-50 border-blue-100 text-[#1a56db]" },
    { name: "Passport", sub: "Fresh, Renewal, Tatkal", icon: Compass, color: "bg-teal-50 border-teal-100 text-teal-600" },
    { name: "Driving License", sub: "Learner's & Permanent", icon: Zap, color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
    { name: "Birth Certificate", sub: "Download & Verify", icon: FileText, color: "bg-violet-50 border-violet-100 text-violet-600" },
    { name: "Income Certificate", sub: "State Revenue Dept", icon: Globe, color: "bg-rose-50 border-rose-100 text-rose-600" },
  ];

  const getStatusBadge = (status) => {
    const map = {
      Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Pending: "bg-red-50 text-red-600 border border-red-200",
      Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
      Submitted: "bg-blue-50 text-blue-700 border border-blue-200",
      "In Review": "bg-amber-50 text-amber-600 border border-amber-200",
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${map[status] || "bg-slate-100 text-slate-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a56db] via-blue-600 to-[#0e7490] p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-1">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋</p>
            <h1 className="text-xl font-bold tracking-tight">{user?.name || "Citizen"}</h1>
            <p className="text-blue-200 text-xs mt-1 max-w-sm">Your AI-powered government portal is ready. What would you like to do today?</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/chat">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-bold transition-all backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" /> Ask AI
              </button>
            </Link>
            <Link href="/dashboard/tracker">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1a56db] hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm">
                <FileText className="w-3.5 h-3.5" /> My Applications
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all card-lift">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {statsLoaded ? card.value : <span className="inline-block w-8 h-6 skeleton-shimmer rounded" />}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{card.label}</p>
              <Link href="/dashboard/tracker" className="text-[10px] font-bold text-[#1a56db] hover:underline mt-2 inline-flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          {/* Services */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Popular Services</h3>
              <Link href="/dashboard/eligibility" className="text-xs font-bold text-[#1a56db] hover:underline flex items-center gap-1">
                All services <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#1a56db]/30 hover:shadow-sm transition-all group text-center">
                    <div className={`w-9 h-9 rounded-xl border ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">{s.name}</p>
                    <p className="text-[9px] text-slate-400 leading-tight hidden sm:block">{s.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
              <Link href="/dashboard/tracker" className="text-xs font-bold text-[#1a56db] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-500">No applications yet</p>
                <Link href="/dashboard/tracker">
                  <button className="mt-3 text-xs font-bold text-[#1a56db] hover:underline">Start tracking →</button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Reference</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Service</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentApps.map((app, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 font-mono text-[10px]">{app.id}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-700">{app.service}</td>
                        <td className="px-5 py-3.5 text-slate-400">{app.date}</td>
                        <td className="px-5 py-3.5">{getStatusBadge(app.status)}</td>
                        <td className="px-5 py-3.5">
                          <Link href="/dashboard/tracker">
                            <button className="text-[10px] font-bold text-[#1a56db] hover:underline flex items-center gap-0.5">
                              Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Help */}
          <div className="bg-gradient-to-r from-slate-900 to-[#1e3a5f] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Need Help?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Get instant answers from our AI assistant</p>
              </div>
            </div>
            <Link href="/dashboard/chat">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1a56db] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/30 flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> Ask AI Assistant
              </button>
            </Link>
          </div>

        </div>

        {/* Right col — AI Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center shadow-sm shadow-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Assistant</p>
                <p className="text-[9px] text-emerald-600 font-semibold status-online">Online</p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              {chatResponse ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-800">You: </span>{chatInput}
                  </div>
                  <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] leading-relaxed text-slate-700">
                    <span className="font-bold text-[#1a56db]">BureauAI: </span>
                    <span className="whitespace-pre-wrap">{chatResponse.replace(/\*\*/g, "").replace(/###\s/g, "").substring(0, 300)}{chatResponse.length > 300 ? "..." : ""}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setChatResponse(null); setChatInput(""); }} className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold">Clear</button>
                    <Link href="/dashboard/chat" className="text-[10px] text-[#1a56db] font-bold hover:underline">Full chat →</Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Hello, {user?.name?.split(" ")[0] || "Citizen"}! 👋</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ask me anything about government services.</p>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "How to update Aadhaar address?",
                      "Documents for PAN Card?",
                      "Track passport application",
                      "Welfare schemes I qualify for",
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setChatInput(q); handleAskAI(q); }}
                        className="w-full text-left px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#1a56db] hover:border-blue-100 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={chatLoading}
                  className="w-full pl-3.5 pr-10 py-2.5 text-[11px] font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] transition-all placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute right-2 p-1.5 bg-[#1a56db] text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all"
                >
                  {chatLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </form>
              <p className="text-[9px] text-slate-400 text-center mt-1.5">Powered by Gemini AI</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
