"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "./layout";
import {
  Folder, Clock, CheckCircle2, AlertCircle, FileText, CreditCard,
  Compass, ArrowRight, Headphones, Sparkles, ChevronRight, Send,
  Loader2, TrendingUp, Shield, Zap, Globe, Calendar, Activity,
  MessageSquarePlus, FileCheck, Download, Building2, Users, Star
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
          setRecentApps(apps.slice(0, 5).map(app => ({
            id: app.referenceNumber || `APP${(app._id || "").slice(-8).toUpperCase()}`,
            service: app.title,
            date: new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: { approved: "Approved", rejected: "Rejected", action_required: "Action Required", submitted: "Submitted", under_review: "Under Review" }[app.status] || "In Progress",
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
    { label: "Total Applications", value: stats.total, icon: Folder, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600", trend: "+12% this month", trendUp: true },
    { label: "In Progress", value: stats.progress, icon: Clock, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", textColor: "text-amber-600", trend: "Processing", trendUp: null },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-50", textColor: "text-emerald-600", trend: "+8 this month", trendUp: true },
    { label: "Action Required", value: stats.action, icon: AlertCircle, color: "from-rose-500 to-red-500", bgColor: "bg-rose-50", textColor: "text-rose-600", trend: "Needs attention", trendUp: false },
  ];

  const services = [
    { name: "Aadhaar", sub: "Update, Download, Verify", icon: Shield, color: "bg-orange-50 border-orange-100 text-orange-600", hoverColor: "hover:border-orange-300 hover:shadow-orange-100" },
    { name: "PAN Card", sub: "Apply, Link with Aadhaar", icon: CreditCard, color: "bg-blue-50 border-blue-100 text-[#1a56db]", hoverColor: "hover:border-blue-300 hover:shadow-blue-100" },
    { name: "Passport", sub: "Fresh, Renewal, Tatkal", icon: Compass, color: "bg-teal-50 border-teal-100 text-teal-600", hoverColor: "hover:border-teal-300 hover:shadow-teal-100" },
    { name: "Driving License", sub: "Learner's & Permanent", icon: Zap, color: "bg-emerald-50 border-emerald-100 text-emerald-600", hoverColor: "hover:border-emerald-300 hover:shadow-emerald-100" },
    { name: "Birth Certificate", sub: "Download & Verify", icon: FileText, color: "bg-violet-50 border-violet-100 text-violet-600", hoverColor: "hover:border-violet-300 hover:shadow-violet-100" },
    { name: "Income Certificate", sub: "State Revenue Dept", icon: Globe, color: "bg-rose-50 border-rose-100 text-rose-600", hoverColor: "hover:border-rose-300 hover:shadow-rose-100" },
  ];

  const quickActions = [
    { name: "Track Application", icon: Activity, href: "/dashboard/tracker", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Upload Documents", icon: Download, href: "/dashboard/upload", color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Check Eligibility", icon: FileCheck, href: "/dashboard/eligibility", color: "text-violet-600", bg: "bg-violet-50" },
    { name: "Chat Support", icon: MessageSquarePlus, href: "/dashboard/chat", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const getStatusBadge = (status) => {
    const map = {
      Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Action Required": "bg-rose-100 text-rose-700 border-rose-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Submitted: "bg-blue-100 text-blue-700 border-blue-200",
      "Under Review": "bg-amber-100 text-amber-700 border-amber-200",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
        {status === "Approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {status === "Action Required" && <AlertCircle className="w-3 h-3 mr-1" />}
        {status}
      </span>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDateDisplay = () => {
    const date = new Date();
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a56db] via-blue-600 to-[#0e7490] p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400/10 rounded-full animate-pulse" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>{getDateDisplay()}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {getGreeting()}, {user?.name?.split(" ")[0] || "Citizen"}! 👋
              </h1>
              <p className="text-blue-200/80 text-sm max-w-lg mt-1">
                Welcome to your personal government services dashboard. Track applications, access services, and get AI-powered assistance.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/chat">
                <button className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                  Ask AI Assistant
                </button>
              </Link>
              <Link href="/dashboard/tracker">
                <button className="flex items-center gap-2 px-5 py-3 bg-white text-[#1a56db] hover:bg-blue-50 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 hover:scale-105">
                  <FileText className="w-4 h-4" />
                  My Applications
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="group bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  card.trendUp === true ? "bg-emerald-50 text-emerald-600" :
                  card.trendUp === false ? "bg-rose-50 text-rose-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  {card.trendUp === true && <TrendingUp className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                {statsLoaded ? card.value : <span className="inline-block w-16 h-9 skeleton-shimmer rounded-lg" />}
              </p>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Services */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Popular Services</h3>
                <p className="text-sm text-slate-500 mt-0.5">Quick access to frequently used government services</p>
              </div>
              <Link href="/dashboard/eligibility" className="text-sm font-semibold text-[#1a56db] hover:text-blue-700 flex items-center gap-1.5 transition-colors">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button key={i} className={`flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg ${s.hoverColor} transition-all duration-300 group`}>
                    <div className={`w-12 h-12 rounded-xl border ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{s.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{s.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-800 to-[#1e3a5f] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Need Assistance?</h4>
                  <p className="text-slate-400 text-sm mt-1">Our AI assistant is available 24/7 to help you with any queries</p>
                </div>
              </div>
              <Link href="/dashboard/chat" className="flex-shrink-0">
                <button className="flex items-center gap-2 px-5 py-3 bg-[#1a56db] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                  Start Chat
                </button>
              </Link>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Your latest application status and history</p>
              </div>
              <Link href="/dashboard/tracker" className="text-sm font-semibold text-[#1a56db] hover:text-blue-700 flex items-center gap-1.5 transition-colors">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="py-16 text-center px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500 mb-2">No applications found</p>
                <p className="text-xs text-slate-400 mb-4">Start by checking your eligibility for government services</p>
                <Link href="/dashboard/eligibility">
                  <button className="text-sm font-semibold text-[#1a56db] hover:underline">Check Eligibility →</button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference No.</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Date</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentApps.map((app, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 font-mono">{app.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">{app.service}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">{app.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/dashboard/tracker">
                            <button className="text-sm font-semibold text-[#1a56db] hover:text-blue-700 flex items-center gap-0.5 ml-auto transition-colors">
                              Details
                              <ChevronRight className="w-4 h-4" />
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

        </div>

        {/* Right col — AI Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm h-full flex flex-col overflow-hidden sticky top-5">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a56db] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">BureauAI</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-emerald-600">Online & Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              {chatResponse ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-600">You</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">Just now</span>
                    </div>
                    <p className="text-sm text-slate-700">{chatInput}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1a56db] flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-[#1a56db]">BureauAI</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {chatResponse.replace(/\*\*/g, "").replace(/###\s/g, "").substring(0, 400)}{chatResponse.length > 400 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setChatResponse(null); setChatInput(""); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">Clear</button>
                    <Link href="/dashboard/chat" className="text-xs font-semibold text-[#1a56db] hover:text-blue-700">Open full chat →</Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-[#1a56db]" />
                    </div>
                    <p className="text-base font-bold text-slate-900">Hello, {user?.name?.split(" ")[0] || "Citizen"}!</p>
                    <p className="text-sm text-slate-500 mt-1">How can I help you today?</p>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Popular Questions</p>
                    {[
                      { q: "How to update Aadhaar address?", icon: Shield },
                      { q: "Documents needed for PAN Card?", icon: CreditCard },
                      { q: "Check passport application status", icon: Compass },
                      { q: "Welfare schemes I qualify for", icon: Star },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { setChatInput(item.q); handleAskAI(item.q); }}
                        className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-slate-400 group-hover:text-[#1a56db] transition-colors" />
                          <span className="text-sm font-medium text-slate-600 group-hover:text-[#1a56db] transition-colors">{item.q}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question..."
                  disabled={chatLoading}
                  className="w-full pl-4 pr-14 py-3.5 text-sm font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p2.5 bg-[#1a56db] text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center w-9 h-9"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-[11px] text-slate-400 text-center mt-3">Powered by Gemini AI • Press Enter to send</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
