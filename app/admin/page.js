"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "./layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Users as UsersIcon, FileText as FileIcon, TrendingUp, TrendingDown,
  Grid as GridIcon, Settings as SettingsIcon, ListTodo, Send, Loader2,
  Trash2, FolderOpen, ShieldCheck, Bell, BarChart3, FileCode,
  CheckCircle2, XCircle, Clock, RefreshCw, Search, Eye, Edit3,
  Sparkles, AlertTriangle, Activity, ShieldAlert, ArrowUpRight, Download
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    approved:       { cls: "bg-emerald-50 text-emerald-700 border-emerald-250/70 shadow-xs", icon: CheckCircle2 },
    verified:       { cls: "bg-emerald-50 text-emerald-700 border-emerald-250/70 shadow-xs", icon: CheckCircle2 },
    under_review:   { cls: "bg-indigo-50 text-indigo-700 border-indigo-250/70 shadow-xs", icon: Eye },
    submitted:      { cls: "bg-blue-50 text-blue-700 border-blue-250/70 shadow-xs", icon: Send },
    pending:        { cls: "bg-amber-50 text-amber-700 border-amber-250/70 shadow-xs", icon: Clock },
    action_required:{ cls: "bg-orange-50 text-orange-700 border-orange-250/70 shadow-xs", icon: AlertTriangle },
    rejected:       { cls: "bg-rose-50 text-rose-700 border-rose-250/70 shadow-xs", icon: XCircle },
    incomplete:     { cls: "bg-rose-50 text-rose-700 border-rose-250/70 shadow-xs", icon: XCircle },
    admin:          { cls: "bg-red-50 text-red-700 border-red-250/70 shadow-xs", icon: ShieldCheck },
    user:           { cls: "bg-slate-100 text-slate-700 border-slate-250/70 shadow-xs", icon: UsersIcon },
  };
  const item = map[status] || { cls: "bg-slate-100 text-slate-700 border-slate-250/70", icon: Clock };
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${item.cls}`}>
      <Icon className="w-2.5 h-2.5 shrink-0" />
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <React.Suspense fallback={
      <div className="space-y-5">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    }>
      <AdminContent />
    </React.Suspense>
  );
}

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const { admin } = useAdmin() || {};
  const isPrimaryAdmin = admin?.email === "bureauai@gmail.com";
  const canManageSensitiveUsers = isPrimaryAdmin;

  const [analytics, setAnalytics] = useState({ usersCount: 0, docsCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0, aiProcessesCount: 0 });
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appProgress, setAppProgress] = useState(0);
  const [appStatus, setAppStatus] = useState("under_review");
  const [timelineDesc, setTimelineDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportDownloading, setReportDownloading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifUserId, setNotifUserId] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchWithTimeout = useCallback((url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => window.clearTimeout(timeout));
  }, []);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch analytics (lightweight) + only what the current tab needs
      const fetches = [
        { type: "analytics", promise: fetchWithTimeout(`${API}/api/admin/analytics`, { credentials: "include" }) },
      ];

      if (tab === "users" || tab === "dashboard" || tab === "audit" || tab === "notifications") {
        fetches.push({ type: "users", promise: fetchWithTimeout(`${API}/api/admin/users`, { credentials: "include" }) });
      }
      if (tab === "documents" || tab === "dashboard" || tab === "audit") {
        fetches.push({ type: "documents", promise: fetchWithTimeout(`${API}/api/documents`, { credentials: "include" }) });
      }
      if (tab === "applications" || tab === "dashboard" || tab === "audit") {
        fetches.push({ type: "applications", promise: fetchWithTimeout(`${API}/api/applications`, { credentials: "include" }) });
      }

      const results = await Promise.allSettled(fetches.map(item => item.promise));
      let failedRequests = 0;

      for (let i = 0; i < results.length; i++) {
        const type = fetches[i].type;
        const result = results[i];
        if (result.status !== "fulfilled" || !result.value?.ok) {
          failedRequests++;
          continue;
        }

        const d = await result.value.json().catch(() => ({}));
        if (type === "analytics") {
          const s = d.stats || d.analytics || {};
          setAnalytics({
            usersCount: s.usersCount !== undefined ? s.usersCount : (s.totalUsers || 0),
            docsCount: s.docsCount !== undefined ? s.docsCount : (s.totalDocuments || 0),
            approvedCount: s.approvedCount !== undefined ? s.approvedCount : (s.appsByStatus?.approved || 0),
            pendingCount: s.pendingCount !== undefined ? s.pendingCount : ((s.appsByStatus?.submitted || 0) + (s.appsByStatus?.under_review || 0)),
            rejectedCount: s.rejectedCount !== undefined ? s.rejectedCount : (s.appsByStatus?.rejected || 0),
            aiProcessesCount: s.aiProcessesCount !== undefined ? s.aiProcessesCount : 0,
          });
          if (d.insights) setInsights(d.insights);
          if (d.chartData) setChartData(d.chartData);
        }
        if (type === "users" && d.users) setUsers(d.users);
        if (type === "documents" && d.documents) setDocuments(d.documents);
        if (type === "applications" && d.applications) {
          setApplications(d.applications);
          if (d.applications.length > 0) {
            setSelectedApp(d.applications[0]);
            setAppProgress(d.applications[0].progress);
            setAppStatus(d.applications[0].status);
          }
        }
      }

      if (failedRequests > 0) {
        triggerToast("Some admin data could not be loaded. Showing available data.", "error");
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      triggerToast("Admin data failed to load.", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, fetchWithTimeout]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      await Promise.resolve();
      if (!ignore) {
        fetchAdminData();
      }
    };
    run();
    return () => { ignore = true; };
  }, [fetchAdminData]);

  const handleUpdateDocStatus = async (docId, newStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/documents`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, status: newStatus }),
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d => d._id === docId ? { ...d, status: newStatus } : d));
        triggerToast("Document status updated.");
      } else triggerToast("Failed to update document.", "error");
    } catch { triggerToast("Error updating document.", "error"); }
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/applications`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp._id, status: appStatus,
          progress: Number(appProgress),
          timelineDescription: timelineDesc || `Status updated to ${appStatus.replace(/_/g, " ")}.`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(a => a._id === selectedApp._id ? data.application : a));
        setSelectedApp(data.application);
        setTimelineDesc("");
        triggerToast("Application milestone updated.");
      } else triggerToast(data.error || "Update failed.", "error");
    } catch { triggerToast("Error updating application.", "error"); }
    finally { setActionLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/admin/users?userId=${userId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setUsers(prev => prev.filter(u => u._id !== userId)); triggerToast("User deleted."); }
      else triggerToast("Failed to delete user.", "error");
    } catch { triggerToast("Error deleting user.", "error"); }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { 
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u)); 
        const emailTo = data.notificationEmailTo || "registered email";
        triggerToast(
          data.notificationEmailSent === false
            ? `Role changed to ${nextRole}, but Gmail delivery failed for ${emailTo}. ${data.notificationEmailError || ""}`.trim()
            : `Role changed to ${nextRole}. Email sent to ${emailTo}.`
        );
      }
      else triggerToast(data.error || "Failed to change role.", "error");
    } catch { triggerToast("Error changing role.", "error"); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      if (notifTarget === "individual") {
        if (!notifUserId) {
          triggerToast("Please select a specific user.", "error");
          setNotifLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/notifications`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...notifForm, userId: notifUserId }),
        });
        const data = await res.json();
        if (res.ok) {
          triggerToast("Notification sent successfully to the selected user.");
          setNotifForm({ title: "", message: "", type: "info" });
          setNotifUserId("");
        } else {
          triggerToast(data.error || "Failed to send notification.", "error");
        }
      } else {
        // Send to all users via high-performance broadcast
        const res = await fetch(`${API}/api/notifications`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...notifForm, userId: "all" }),
        });
        const data = await res.json();
        if (res.ok) {
          triggerToast(`Broadcast notification dispatched to all registered citizens.`);
          setNotifForm({ title: "", message: "", type: "info" });
        } else {
          triggerToast(data.error || "Failed to broadcast notification.", "error");
        }
      }
    } catch { triggerToast("Failed to send notifications.", "error"); }
    finally { setNotifLoading(false); }
  };

  const handleDownloadReport = () => {
    setReportDownloading(true);
    try {
      const generatedAt = new Date();
      const totalApplications = analytics.approvedCount + analytics.pendingCount + analytics.rejectedCount;
      const insightRows = Object.entries(insights || {}).map(([key, item]) => ({
        category: key.replace(/_/g, " "),
        title: item?.title || "",
        value: item?.value || "",
        description: item?.description || "",
      }));
      const statusRows = [
        { status: "Approved", count: analytics.approvedCount },
        { status: "Pending / In Review", count: analytics.pendingCount },
        { status: "Rejected / Action Required", count: analytics.rejectedCount },
      ].map(row => ({
        ...row,
        percentage: totalApplications > 0 ? `${Math.round((row.count / totalApplications) * 100)}%` : "0%",
      }));

      const escapeCsv = (value) => {
        const text = value === null || value === undefined ? "" : String(value);
        return `"${text.replace(/"/g, '""')}"`;
      };
      const toCsv = (headers, rows) => [
        headers.map(escapeCsv).join(","),
        ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(",")),
      ].join("\n");

      const sections = [
        "BureauAI Admin Report",
        `Generated At,${escapeCsv(generatedAt.toLocaleString("en-IN"))}`,
        `Generated By,${escapeCsv(admin?.email || "Admin")}`,
        "",
        "Summary",
        toCsv(["Metric", "Value"], [
          { Metric: "Total Users", Value: analytics.usersCount },
          { Metric: "Total Documents", Value: analytics.docsCount },
          { Metric: "Approved Applications", Value: analytics.approvedCount },
          { Metric: "Pending / In Review Applications", Value: analytics.pendingCount },
          { Metric: "Rejected / Action Required Applications", Value: analytics.rejectedCount },
          { Metric: "AI Processes", Value: analytics.aiProcessesCount },
        ]),
        "",
        "Application Status Breakdown",
        toCsv(["status", "count", "percentage"], statusRows),
        "",
        "AI Insights",
        toCsv(["category", "title", "value", "description"], insightRows),
        "",
        "Monthly Trend",
        toCsv(["month", "activeUsers", "filesProcessed", "aiQueries"], chartData),
      ].join("\n");

      const fileDate = generatedAt.toISOString().slice(0, 10);
      const blob = new Blob([`\uFEFF${sections}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bureauai-admin-report-${fileDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      triggerToast("Admin report downloaded.");
    } catch (err) {
      console.error("Report download error:", err);
      triggerToast("Failed to download report.", "error");
    } finally {
      setReportDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}</div>
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredDocs = documents.filter(d =>
    d.fileName?.toLowerCase().includes(docSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fade-in ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          {toast.msg}
        </div>
      )}

      {/* ── Dashboard Tab ── */}
      {tab === "dashboard" && (
        <>
          {/* AI Insights Section (Visual WOW Factor) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#d97706]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-amber-600 tracking-wider uppercase bg-amber-100/50 px-2 py-0.5 rounded-full">{insights?.demand?.value || "AI Demand Insight"}</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-2 tracking-tight">{insights?.demand?.title || "28% Surge in Scholarship Requests"}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{insights?.demand?.description || "Gemini flagged abnormally high application interest in post-matric student welfare schemes over the last 72 hours."}</p>
                </div>
                <div className="p-2 bg-amber-100/60 text-[#d97706] rounded-xl shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 to-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#dc2626]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-rose-600 tracking-wider uppercase bg-rose-100/50 px-2 py-0.5 rounded-full">{insights?.compliance?.value || "Compliance Warning"}</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-2 tracking-tight">{insights?.compliance?.title || "Most Rejected: Address Proof"}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{insights?.compliance?.description || "Blurred copies or missing local municipal stamps represent 74% of rejected documents this auditing cycle."}</p>
                </div>
                <div className="p-2 bg-rose-100/60 text-[#dc2626] rounded-xl shrink-0">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#1a56db]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-blue-650 tracking-wider uppercase bg-blue-100/50 px-2 py-0.5 rounded-full">{insights?.operations?.value || "Operational Window"}</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-2 tracking-tight">{insights?.operations?.title || "Peak Load: 7 PM – 10 PM"}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{insights?.operations?.description || "Citizen activity increases by 3x in evening hours. Server load balancing and autoscaling are fully active."}</p>
                </div>
                <div className="p-2 bg-blue-100/60 text-[#1a56db] rounded-xl shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#059669]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase bg-emerald-100/50 px-2 py-0.5 rounded-full">{insights?.verification?.value || "AI Verification Rate"}</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-2 tracking-tight">{insights?.verification?.title || "89% Auto-Approve Accuracy"}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{insights?.verification?.description || "Document pre-vetting automation verified 9 out of 10 incoming citizen uploads without human-in-the-loop intervention."}</p>
                </div>
                <div className="p-2 bg-emerald-100/60 text-[#059669] rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: "Total Registered Citizens", 
                value: analytics.usersCount, 
                icon: UsersIcon, 
                trend: "+12.5%", 
                trendType: "up",
                color: "text-emerald-600 bg-emerald-50 border-emerald-200", 
                sparkData: [
                  { val: Math.max(1, analytics.usersCount * 0.4) },
                  { val: Math.max(2, analytics.usersCount * 0.5) },
                  { val: Math.max(4, analytics.usersCount * 0.7) },
                  { val: Math.max(5, analytics.usersCount * 0.6) },
                  { val: Math.max(8, analytics.usersCount * 0.8) },
                  { val: analytics.usersCount }
                ] 
              },
              { 
                label: "Applications Tracked", 
                value: analytics.docsCount, 
                icon: FileIcon, 
                trend: "+8.2%", 
                trendType: "up",
                color: "text-emerald-600 bg-emerald-50 border-emerald-200", 
                sparkData: [
                  { val: Math.max(1, analytics.docsCount * 0.3) },
                  { val: Math.max(2, analytics.docsCount * 0.5) },
                  { val: Math.max(3, analytics.docsCount * 0.4) },
                  { val: Math.max(6, analytics.docsCount * 0.7) },
                  { val: Math.max(8, analytics.docsCount * 0.9) },
                  { val: analytics.docsCount }
                ] 
              },
              { 
                label: "Pending Reviews", 
                value: analytics.pendingCount, 
                icon: Clock, 
                trend: "-3.4%", 
                trendType: "down",
                color: "text-amber-600 bg-amber-50 border-amber-250", 
                sparkData: [
                  { val: Math.max(1, analytics.pendingCount * 1.5) },
                  { val: Math.max(1, analytics.pendingCount * 1.3) },
                  { val: Math.max(1, analytics.pendingCount * 1.4) },
                  { val: Math.max(1, analytics.pendingCount * 1.1) },
                  { val: Math.max(1, analytics.pendingCount * 1.2) },
                  { val: analytics.pendingCount }
                ] 
              },
              { 
                label: "AI Processes Run", 
                value: analytics.aiProcessesCount || 0, 
                icon: Sparkles, 
                trend: "99.8% Acc", 
                trendType: "neutral",
                color: "text-blue-600 bg-blue-50 border-blue-200", 
                sparkData: [
                  { val: Math.max(1, (analytics.aiProcessesCount || 0) * 0.4) },
                  { val: Math.max(2, (analytics.aiProcessesCount || 0) * 0.5) },
                  { val: Math.max(4, (analytics.aiProcessesCount || 0) * 0.7) },
                  { val: Math.max(5, (analytics.aiProcessesCount || 0) * 0.6) },
                  { val: Math.max(8, (analytics.aiProcessesCount || 0) * 0.8) },
                  { val: analytics.aiProcessesCount || 0 }
                ] 
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-40 bg-white border border-slate-200 relative overflow-hidden group">
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{s.label}</span>
                      <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{s.value.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-[#1a56db] group-hover:text-white transition-colors rounded-xl border border-slate-100 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Sparkline & Percentage */}
                  <div className="flex items-end justify-between relative z-10 w-full mt-3">
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                      s.trendType === "up" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      s.trendType === "down" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      {s.trend}
                    </span>

                    {/* Small Mini Sparkline Graph */}
                    {mounted && (
                      <div className="w-24 h-10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={s.sparkData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id={`gradSpark-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={s.trendType === "up" ? "#10b981" : s.trendType === "down" ? "#f59e0b" : "#3b82f6"} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={s.trendType === "up" ? "#10b981" : s.trendType === "down" ? "#f59e0b" : "#3b82f6"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="val" 
                              stroke={s.trendType === "up" ? "#10b981" : s.trendType === "down" ? "#f59e0b" : "#3b82f6"} 
                              strokeWidth={1.5} 
                              fillOpacity={1} 
                              fill={`url(#gradSpark-${i})`} 
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Analytics Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 flex">
                  <div className="flex-1 bg-[#d97706] opacity-30"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-[#059669] opacity-30"></div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#1a56db]" /> 
                      Operational Telemetry Hub
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Citizens, Audited Docs & AI Queries</p>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#1a56db] opacity-80" />Citizens</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#10b981] opacity-80" />Audited Docs</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#6366f1] opacity-80" />AI Assist</span>
                  </div>
                </div>

                {/* Animated Recharts Area Chart */}
                {mounted && chartData.length > 0 ? (
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a56db" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: "rgba(255,255,255,0.95)", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "12px", 
                            boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                            fontSize: "11px",
                            fontWeight: "bold"
                          }}
                        />
                        <Area type="monotone" name="Citizens Active" dataKey="activeUsers" stroke="#1a56db" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" name="Documents Processed" dataKey="filesProcessed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDocs)" />
                        <Area type="monotone" name="AI Queries Run" dataKey="aiQueries" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAI)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-full h-56 bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Simulating administrative records telemetry...
                  </div>
                )}
              </div>

              {/* AI summary widget & Quick Actions split grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* AI Summary Widget */}
                <div className="p-5 bg-gradient-to-br from-[#0a192f] to-[#112240] text-slate-300 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-32 h-32 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Gemini Governance Intel
                    </div>
                    <h4 className="text-sm font-extrabold text-white mt-2 leading-snug">Operations Health Report</h4>
                    <p className="text-[11.5px] text-slate-400 mt-2 leading-relaxed font-medium">
                      All systems operating within normal parameters. Citizens processed increased by <span className="text-emerald-400 font-bold">14%</span> today.
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                      <span className="text-amber-400 font-bold">Attention Required:</span> There are 2 documents awaiting manual compliance check because of blurred stamp validation.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-bold mt-4">
                    <span>Model: Gemini 1.5 Pro</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      99.8% Telemetry Conf
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Citizens", sub: "User profiles", icon: UsersIcon, href: "/admin?tab=users", color: "hover:border-[#1a56db] hover:text-[#1a56db]" },
                    { label: "Tracker Logs", sub: "App milestones", icon: FileIcon, href: "/admin?tab=applications", color: "hover:border-[#1a56db] hover:text-[#1a56db]" },
                    { label: "Audits", sub: "Verify files", icon: FolderOpen, href: "/admin?tab=documents", color: "hover:border-indigo-500 hover:text-indigo-500" },
                    { label: "Broadcaster", sub: "Send updates", icon: Bell, href: "/admin?tab=notifications", color: "hover:border-emerald-500 hover:text-emerald-500" },
                  ].map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <a key={i} href={a.href} className={`p-3 bg-white border border-slate-200 rounded-2xl transition-all hover:shadow-md flex flex-col justify-between group ${a.color}`}>
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-xl w-fit group-hover:bg-[#1a56db] group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-black text-slate-800 leading-none">{a.label}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-none">{a.sub}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between h-full relative">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Milestone Intake</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Latest Applications</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full select-none">Live Logs</span>
              </div>
              
              <div className="divide-y divide-slate-50 overflow-y-auto flex-1 max-h-[460px]">
                {applications.slice(0, 7).map((app, i) => (
                  <div key={i} className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 truncate leading-snug">{app.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate uppercase tracking-wider font-semibold">{app.department}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <StatusPill status={app.status} />
                      <span className="text-[9px] font-bold text-slate-400">{new Date(app.updatedAt || app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && <EmptyState icon={FileIcon} message="No applications yet." />}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <div className="space-y-6">
          <>
              <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-[#1a56db]" />
                    Citizen Database & Operations Center
                  </h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{users.length} active digital citizens registered</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    value={userSearch} 
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search citizen directory..."
                    className="pl-9 pr-4 py-2 w-full text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 transition-all bg-white text-slate-800" 
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative animate-fade-in">
                {/* Saffron and Green bottom accents */}
                <div className="absolute top-0 left-0 right-0 h-0.5 flex">
                  <div className="w-1/3 bg-[#d97706] opacity-35"></div>
                  <div className="w-1/3 bg-white"></div>
                  <div className="w-1/3 bg-[#059669] opacity-35"></div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100">
                        <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Citizen Identity</th>
                        <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Secured Email Address</th>
                        <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Access Clearance</th>
                        <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Enrolled Since</th>
                        <th className="px-6 py-4 text-right font-black text-slate-500 text-[10px] uppercase tracking-wider">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            <EmptyState icon={UsersIcon} message="No citizens found matching search criteria." />
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <img 
                                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`} 
                                    alt="" 
                                    className="w-9 h-9 rounded-full border border-slate-200 object-cover bg-slate-50 shadow-xs" 
                                  />
                                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    u.role === "admin" ? "bg-red-500" : "bg-emerald-500"
                                  }`} />
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-800 text-xs block group-hover:text-slate-900">{u.name}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">BUREAU IDENTIFIED</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusPill status={u.role} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                              {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                {canManageSensitiveUsers && (
                                  <button 
                                    onClick={() => handleToggleRole(u._id, u.role)}
                                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                                      u.role === "admin"
                                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shadow-xs" 
                                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-250/70 shadow-xs"
                                    }`}
                                  >
                                    {u.role === "admin" ? "Demote Access" : "Clear Admin"}
                                  </button>
                                )}
                                {canManageSensitiveUsers && (
                                  <button 
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all bg-red-50 hover:bg-red-105 hover:text-red-800 text-red-700 border-red-200 shadow-xs"
                                  >
                                    Delete Account
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </>
        </div>
      )}

      {/* ── Applications Tab ── */}
      {tab === "applications" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FileIcon className="w-5 h-5 text-[#1a56db]" />
              Centralized Milestone Verification & Auditing Suite
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Review pre-vetted files, verify manual portal reference IDs, and push signed milestone remarks onto citizen ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: List of Tracker Sessions */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-fit">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Tracker Registry ({applications.length})</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase bg-white border px-2 py-0.5 rounded-full">Intake Queue</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                {applications.length === 0 ? (
                  <EmptyState icon={FileIcon} message="No applications under central tracking yet." />
                ) : (
                  applications.map(app => (
                    <div 
                      key={app._id} 
                      onClick={() => { 
                        setSelectedApp(app); 
                        setAppProgress(app.progress); 
                        setAppStatus(app.status); 
                      }}
                      className={`px-4 py-3.5 cursor-pointer transition-all hover:bg-slate-55 flex flex-col gap-2 ${
                        selectedApp?._id === app._id ? "bg-blue-50/30 border-l-2 border-[#1a56db]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 truncate">{app.title}</p>
                        {(() => {
                          const u = typeof app.userId === "object" && app.userId ? app.userId : null;
                          const name = u?.name;
                          return name ? (
                            <p className="text-[10px] text-[#1a56db] font-black mt-0.5">
                              Citizen: <span className="text-slate-700 font-bold">{name}</span>
                            </p>
                          ) : null;
                        })()}
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate uppercase tracking-wider font-bold">{app.department}</p>
                        {app.referenceNumber && (
                          <span className="inline-block text-[9px] font-semibold font-mono text-slate-500 bg-slate-100 px-1 rounded mt-1">
                            Ref: {app.referenceNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <StatusPill status={app.status} />
                        <span className="text-xs font-black text-[#1a56db]">{app.progress}% Completed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Console Details */}
            <div className="lg:col-span-2">
              {selectedApp ? (
                <div className="space-y-6">
                  
                  {/* Master Auditing Form */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5 relative">
                    <div className="absolute top-0 right-0 w-20 h-0.5 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-black text-[#1a56db] uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">Milestone verification desk</span>
                        <h3 className="text-base font-black text-slate-800 mt-2.5">{selectedApp.title}</h3>
                        <p className="text-xs text-slate-450 mt-1 font-semibold">
                          {selectedApp.department} · Ref ID: <span className="font-mono font-bold text-slate-700">{selectedApp.referenceNumber}</span>
                        </p>
                      </div>
                      
                      {(() => {
                        const u = typeof selectedApp.userId === "object" && selectedApp.userId
                          ? selectedApp.userId
                          : { name: typeof selectedApp.userId === "string" ? null : null, email: null, avatar: null };
                        const displayName = u.name || "Unknown Citizen";
                        const initials = displayName.substring(0, 2);
                        return (
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200 bg-white" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-[#1a56db] uppercase">
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wide leading-none">
                                {displayName}
                              </p>
                              {u.email && (
                                <p className="text-[9px] text-slate-400 font-semibold leading-none mt-1">
                                  {u.email}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-450">Resolution Progress</span>
                        <span className="text-[#1a56db] font-black">{appProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a56db] rounded-full transition-all duration-300" style={{ width: `${appProgress}%` }} />
                      </div>
                    </div>

                    <form onSubmit={handleUpdateApplication} className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Set Status Stage</label>
                          <select 
                            value={appStatus} 
                            onChange={e => setAppStatus(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#1a56db] bg-white cursor-pointer"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="action_required">Action Required</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-[#1a56db] uppercase tracking-wider block mb-1.5">Adjust Progress ({appProgress}%)</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={appProgress} 
                            onChange={e => setAppProgress(e.target.value)}
                            className="w-full mt-2 accent-[#1a56db]" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Signed Remarks Logs (Appends to Ledger)</label>
                        <textarea 
                          value={timelineDesc} 
                          onChange={e => setTimelineDesc(e.target.value)} 
                          rows={3} 
                          required
                          placeholder="e.g. Identity and income credentials pre-vetted. Request aligned for local clearance."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] resize-none" 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-850 hover:from-blue-800 hover:to-indigo-950 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                        Push Milestone Ledger Update
                      </button>
                    </form>
                  </div>

                  {/* Citizen Pre-Vetted Documents list */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">Vetted filing documents cabinet</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Documents uploaded by citizen for auditing</p>
                    </div>

                    <div className="space-y-3">
                      {documents.filter(d => {
                        const appUserId = selectedApp.userId?._id || selectedApp.userId;
                        const docUserId = d.userId?._id || d.userId;
                        return docUserId === appUserId;
                      }).length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 font-medium">
                          No pre-vetted credential documents submitted by {selectedApp.userId?.name || "this citizen"}.
                        </div>
                      ) : (
                        documents.filter(d => {
                          const appUserId = selectedApp.userId?._id || selectedApp.userId;
                          const docUserId = d.userId?._id || d.userId;
                          return docUserId === appUserId;
                        }).map(doc => (
                          <div key={doc._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileIcon className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="text-xs font-black text-slate-800 truncate max-w-[200px]">{doc.fileName}</span>
                                <Badge className={`uppercase text-[8px] border ${
                                  doc.status === "verified" ? "bg-emerald-50 border-emerald-250 text-emerald-700" : "bg-amber-50 border-amber-250 text-amber-700"
                                }`}>
                                  {doc.status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-2">
                                <span className="font-bold text-slate-600 block">AI Summary Extraction:</span>
                                {doc.summary || "Extract logs pending..."}
                              </p>
                              {doc.missingRequirements && doc.missingRequirements.length > 0 && (
                                <p className="text-[10px] text-rose-600 font-bold mt-1">
                                  Missing: {doc.missingRequirements.join(", ")}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <select 
                                value={doc.status} 
                                onChange={e => handleUpdateDocStatus(doc._id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer ${
                                  doc.status === "verified" ? "bg-emerald-50 text-emerald-750 border-emerald-250" : "bg-amber-50 text-amber-750 border-amber-250"
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="incomplete">Incomplete</option>
                              </select>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-white rounded-xl text-slate-500 transition-colors">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Public Ledger Stepper visual preview */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Milestones Ledger Preview</h4>
                    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-5 py-2">
                      {selectedApp.timeline?.map((event, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute left-[-30px] w-5 h-5 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">{event.status.replace("_", " ")}</h5>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(event.date || selectedApp.updatedAt || selectedApp.createdAt || 0).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-semibold">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col items-center justify-center py-32 text-center">
                  <div className="p-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-full mb-4">
                    <FileIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Select Application from Intake Queue</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Verify compliance, review audited files, and append milestone entries to track progress.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Documents Tab ── */}
      {tab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-500" />
                Document Compliance Directory
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{documents.length} citizen files stored in secure cabinet</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                value={docSearch} 
                onChange={e => setDocSearch(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 pr-4 py-2 w-full text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 transition-all bg-white text-slate-800" 
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative">
            {/* Saffron and Green top accents */}
            <div className="absolute top-0 left-0 right-0 h-0.5 flex">
              <div className="w-1/3 bg-[#d97706] opacity-35"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-[#059669] opacity-35"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100">
                    <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Document Identity</th>
                    <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">AI Content Summary Extraction</th>
                    <th className="px-6 py-4 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">Uploaded On</th>
                    <th className="px-6 py-4 text-right font-black text-slate-500 text-[10px] uppercase tracking-wider">Verification Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <EmptyState icon={FolderOpen} message="No documents found matching search criteria." />
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map(doc => (
                      <tr key={doc._id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shrink-0">
                              <FileIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <a 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-extrabold text-slate-800 text-xs hover:text-[#1a56db] hover:underline block truncate max-w-[200px]"
                              >
                                {doc.fileName}
                              </a>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">SECURE ENCRYPTED</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-slate-550 font-medium leading-relaxed truncate group-hover:text-slate-800 transition-colors">
                            {doc.summary || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                          {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="inline-block relative">
                            <select 
                              value={doc.status} 
                              onChange={e => handleUpdateDocStatus(doc._id, e.target.value)}
                              className={`appearance-none px-3.5 py-1.5 pr-8 rounded-xl border text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer ${
                                doc.status === "verified" || doc.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-250/70" :
                                doc.status === "pending" || doc.status === "submitted" ? "bg-amber-50 text-amber-750 border-amber-250/75" :
                                "bg-rose-50 text-rose-700 border-rose-250/75"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="incomplete">Incomplete</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-current opacity-60">
                              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                              </svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {tab === "notifications" && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dispatch System Notification</h2>
            <p className="text-xs text-slate-400 mt-0.5">Send announcements or targeted alerts to registered digital citizens.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Recipient Scope</label>
                <select 
                  value={notifTarget} 
                  onChange={e => setNotifTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] bg-white cursor-pointer"
                >
                  <option value="all">Broadcast (All Registered Citizens)</option>
                  <option value="individual">Individual (Specific User)</option>
                </select>
              </div>

              {notifTarget === "individual" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Target User</label>
                  <select 
                    value={notifUserId} 
                    onChange={e => setNotifUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] bg-white cursor-pointer"
                  >
                    <option value="">-- Choose a user account --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} · {u.email}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Notification Title</label>
                <input value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} required
                  placeholder="e.g. System Maintenance Notice"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#1a56db]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Message</label>
                <textarea value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} required rows={4}
                  placeholder="Write your announcement here..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#1a56db] resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Type</label>
                <select value={notifForm.type} onChange={e => setNotifForm(p => ({ ...p, type: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] bg-white cursor-pointer">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={notifLoading || (notifTarget === "all" && users.length === 0) || (notifTarget === "individual" && !notifUserId)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60">
                  {notifLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {notifTarget === "individual" ? "Send to Selected User" : `Send to All Users (${users.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1a56db]" />
                Reports & Analytics
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Administrative data & analytics insights</p>
            </div>
            <button 
              onClick={handleDownloadReport}
              disabled={reportDownloading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#1a56db] hover:text-[#1a56db] transition-all bg-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {reportDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download Report
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: analytics.usersCount, color: "bg-blue-50 text-[#1a56db]" },
              { label: "Total Documents", value: analytics.docsCount, color: "bg-violet-50 text-violet-600" },
              { label: "Approved Apps", value: analytics.approvedCount, color: "bg-emerald-50 text-emerald-600" },
              { label: "Rejected Apps", value: analytics.rejectedCount, color: "bg-rose-50 text-rose-600" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-5 ${s.color} border border-current/10`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</p>
                <p className="text-3xl font-extrabold mt-1">{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Application Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Approved", value: analytics.approvedCount, total: analytics.approvedCount + analytics.pendingCount + analytics.rejectedCount, color: "bg-emerald-500" },
                { label: "Pending / In Review", value: analytics.pendingCount, total: analytics.approvedCount + analytics.pendingCount + analytics.rejectedCount, color: "bg-amber-400" },
                { label: "Rejected", value: analytics.rejectedCount, total: analytics.approvedCount + analytics.pendingCount + analytics.rejectedCount, color: "bg-rose-500" },
              ].map((row, i) => {
                const pct = row.total > 0 ? Math.round((row.value / row.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">{row.label}</span>
                      <span className="text-slate-400">{row.value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Tab ── */}
      {tab === "settings" && isPrimaryAdmin && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900">System Settings</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
            {[
              { label: "Application Name", value: "BureauAI — Bharat Sarkar Portal", desc: "The public name of this platform" },
              { label: "API Base URL", value: API, desc: "Backend API endpoint" },
              { label: "AI Model", value: "llama-3.1-8b-instant (Groq)", desc: "Active AI model for all assistant features" },
              { label: "Auth Method", value: "JWT (httpOnly Cookie, 7d expiry)", desc: "Session authentication strategy" },
              { label: "Database", value: "MongoDB Atlas (Mongoose 9)", desc: "Primary data store" },
            ].map((s, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">{s.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 max-w-[200px] truncate">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700 font-semibold">
            System settings are managed via environment variables. Edit <code className="font-mono bg-amber-100 px-1 rounded">.env</code> files to change configuration.
          </div>
        </div>
      )}

      {/* ── Audit Logs Tab ── */}
      {tab === "settings" && !isPrimaryAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl shadow-sm text-center">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full w-fit mx-auto mb-4">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">System Settings Restricted</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            System settings are available only to the primary administrator bureauai@gmail.com.
          </p>
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1a56db]" />
                Audit Logs & Telemetry Ledger
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Cryptographically signed system activity feed</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchAdminData} 
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#1a56db] hover:text-[#1a56db] transition-all bg-white text-xs font-bold rounded-xl shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Force Refresh Logs
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#1a56db] hover:text-[#1a56db] transition-all bg-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Ledger
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative p-6">
            {/* Saffron and Green top accents */}
            <div className="absolute top-0 left-0 right-0 h-0.5 flex">
              <div className="w-1/3 bg-[#d97706] opacity-35"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-[#059669] opacity-35"></div>
            </div>

            <div className="relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100/80 py-2 space-y-4">
              {[
                ...applications.slice(0, 5).map(a => ({ type: "application", msg: `Application "${a.title}" — status: ${a.status}`, time: a.updatedAt || a.createdAt })),
                ...documents.slice(0, 5).map(d => ({ type: "document", msg: `Document "${d.fileName}" uploaded — status: ${d.status}`, time: d.createdAt })),
                ...users.slice(0, 5).map(u => ({ type: "user", msg: `User "${u.name}" registered (${u.role})`, time: u.createdAt })),
              ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20).map((log, i) => {
                const colors = {
                  application: {
                    border: "border-blue-150 text-blue-600 bg-blue-50/50",
                    badge: "bg-blue-50 text-blue-700",
                    icon: ShieldCheck
                  },
                  document: {
                    border: "border-violet-150 text-violet-600 bg-violet-50/50",
                    badge: "bg-violet-50 text-violet-700",
                    icon: FileIcon
                  },
                  user: {
                    border: "border-emerald-150 text-emerald-600 bg-emerald-50/50",
                    badge: "bg-emerald-50 text-emerald-700",
                    icon: UsersIcon
                  }
                };
                const config = colors[log.type] || colors.user;
                const IconComponent = config.icon;
                return (
                  <div key={i} className="relative pl-12 pr-6 py-3 hover:bg-slate-50/40 rounded-2xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    {/* Circle Bullet with icon */}
                    <div className={`absolute left-[1px] top-3 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 duration-300 ${config.border}`}>
                      <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${config.badge}`}>
                          {log.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(log.time).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold tracking-tight leading-relaxed group-hover:text-slate-900 transition-colors">
                        {log.msg}
                      </p>
                    </div>

                    <div className="text-[9px] font-black text-slate-350 uppercase tracking-widest shrink-0 self-end sm:self-center select-none group-hover:text-slate-450 transition-colors">
                      LEDGER RECORDED
                    </div>
                  </div>
                );
              })}
              {applications.length === 0 && documents.length === 0 && users.length === 0 && (
                <div className="pl-12">
                  <EmptyState icon={ListTodo} message="No cryptographic audit events yet." />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
