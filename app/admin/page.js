"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Users as UsersIcon, FileText as FileIcon, TrendingUp, TrendingDown,
  Grid as GridIcon, Settings as SettingsIcon, ListTodo, Send, Loader2,
  Trash2, FolderOpen, ShieldCheck, Bell, BarChart3, FileCode,
  CheckCircle2, XCircle, Clock, RefreshCw, Search, Eye, Edit3
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    approved:       "bg-emerald-50 text-emerald-700 border-emerald-200",
    verified:       "bg-emerald-50 text-emerald-700 border-emerald-200",
    under_review:   "bg-blue-50 text-blue-700 border-blue-200",
    submitted:      "bg-blue-50 text-blue-700 border-blue-200",
    pending:        "bg-amber-50 text-amber-600 border-amber-200",
    action_required:"bg-orange-50 text-orange-600 border-orange-200",
    rejected:       "bg-rose-50 text-rose-700 border-rose-200",
    incomplete:     "bg-rose-50 text-rose-700 border-rose-200",
    admin:          "bg-red-50 text-red-700 border-red-200",
    user:           "bg-slate-100 text-slate-600 border-slate-200",
  };
  const cls = map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${cls}`}>
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
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  const [analytics, setAnalytics] = useState({ usersCount: 0, docsCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 });
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appProgress, setAppProgress] = useState(0);
  const [appStatus, setAppStatus] = useState("under_review");
  const [timelineDesc, setTimelineDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" });
  const [notifLoading, setNotifLoading] = useState(false);

  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch analytics (lightweight) + only what the current tab needs
      const fetches = [
        fetch(`${API}/api/admin/analytics`, { credentials: "include" }),
      ];

      if (tab === "users" || tab === "dashboard" || tab === "audit" || tab === "notifications") {
        fetches.push(fetch(`${API}/api/admin/users`, { credentials: "include" }));
      }
      if (tab === "documents" || tab === "dashboard" || tab === "audit") {
        fetches.push(fetch(`${API}/api/documents`, { credentials: "include" }));
      }
      if (tab === "applications" || tab === "dashboard" || tab === "audit") {
        fetches.push(fetch(`${API}/api/applications`, { credentials: "include" }));
      }

      const results = await Promise.all(fetches);
      let ri = 0;

      if (results[ri]?.ok) {
        const d = await results[ri].json();
        const s = d.stats || d.analytics || {};
        setAnalytics({
          usersCount: s.totalUsers || 0,
          docsCount: s.totalDocuments || 0,
          approvedCount: s.appsByStatus?.approved || 0,
          pendingCount: (s.appsByStatus?.submitted || 0) + (s.appsByStatus?.under_review || 0),
          rejectedCount: s.appsByStatus?.rejected || 0,
        });
      }
      ri++;

      for (const res of results.slice(1)) {
        if (!res?.ok) { ri++; continue; }
        const d = await res.json();
        if (d.users) setUsers(d.users);
        if (d.documents) setDocuments(d.documents);
        if (d.applications) {
          const apps = d.applications;
          setApplications(apps);
          if (apps.length > 0) { setSelectedApp(apps[0]); setAppProgress(apps[0].progress); setAppStatus(apps[0].status); }
        }
        ri++;
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

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
      if (res.ok) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u)); triggerToast(`Role changed to ${nextRole}.`); }
      else triggerToast("Failed to change role.", "error");
    } catch { triggerToast("Error changing role.", "error"); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      // Send to all users
      const results = await Promise.all(
        users.map(u =>
          fetch(`${API}/api/notifications`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...notifForm, userId: u._id }),
          }).catch(() => null)
        )
      );
      triggerToast(`Notification sent to ${users.length} users.`);
      setNotifForm({ title: "", message: "", type: "info" });
    } catch { triggerToast("Failed to send notifications.", "error"); }
    finally { setNotifLoading(false); }
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Users", value: analytics.usersCount, icon: UsersIcon, trend: "+12.5%", color: "text-emerald-600" },
              { label: "Total Documents", value: analytics.docsCount, icon: FileIcon, trend: "+8.2%", color: "text-emerald-600" },
              { label: "Approved", value: analytics.approvedCount, icon: CheckCircle2, trend: "+10.1%", color: "text-emerald-600" },
              { label: "Pending", value: analytics.pendingCount, icon: Clock, trend: "+5.4%", color: "text-amber-600" },
              { label: "Rejected", value: analytics.rejectedCount, icon: XCircle, trend: "-2.1%", color: "text-rose-600" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${s.color}`}>
                      <TrendingUp className="w-3 h-3" />{s.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value.toLocaleString()}</p>
                  <Icon className="w-4 h-4 text-slate-300 mt-1" />
                </div>
              );
            })}
          </div>

          {/* Charts + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Application Overview</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1a56db]" />Total</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Approved</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />Rejected</span>
                  </div>
                </div>
                <svg className="w-full h-44" viewBox="0 0 500 160" fill="none">
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="55" x2="480" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="125" x2="480" y2="125" stroke="#e2e8f0" strokeWidth="1" />
                  <text x="10" y="24" fontSize="8" fill="#94a3b8">10K</text>
                  <text x="10" y="59" fontSize="8" fill="#94a3b8">7K</text>
                  <text x="10" y="94" fontSize="8" fill="#94a3b8">4K</text>
                  <text x="10" y="129" fontSize="8" fill="#94a3b8">1K</text>
                  <path d="M40 85 Q150 45 250 65 T480 50" stroke="#1a56db" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M40 100 Q150 70 250 88 T480 72" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M40 130 Q150 118 250 122 T480 118" stroke="#f43f5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <circle cx="250" cy="65" r="4" fill="#1a56db" stroke="white" strokeWidth="2" />
                  <circle cx="250" cy="88" r="4" fill="#10b981" stroke="white" strokeWidth="2" />
                  {["12 May","13 May","14 May","15 May","16 May","17 May","18 May"].map((d, i) => (
                    <text key={i} x={40 + i * 73} y="148" fontSize="8" fill="#94a3b8" textAnchor="middle">{d}</text>
                  ))}
                </svg>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Manage Users", icon: UsersIcon, href: "/admin?tab=users" },
                  { label: "Applications", icon: FileIcon, href: "/admin?tab=applications" },
                  { label: "Documents", icon: FolderOpen, href: "/admin?tab=documents" },
                  { label: "Send Notification", icon: Bell, href: "/admin?tab=notifications" },
                  { label: "Reports", icon: BarChart3, href: "/admin?tab=analytics" },
                  { label: "System Settings", icon: SettingsIcon, href: "/admin?tab=settings" },
                ].map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <a key={i} href={a.href} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#1a56db] hover:shadow-md transition-all group flex flex-col gap-2">
                      <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-xl w-fit group-hover:bg-[#1a56db] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">{a.label}</p>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {applications.slice(0, 6).map((app, i) => (
                  <div key={i} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{app.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{app.department}</p>
                      </div>
                      <StatusPill status={app.status} />
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
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Citizen Database</h2>
              <p className="text-xs text-slate-400 mt-0.5">{users.length} registered users</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] w-64 bg-white" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3.5 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0
                    ? <tr><td colSpan="5"><EmptyState icon={UsersIcon} message="No users found." /></td></tr>
                    : filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3.5"><StatusPill status={u.role} /></td>
                        <td className="px-5 py-3.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleToggleRole(u._id, u.role)}
                              className="px-3 py-1.5 text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                              {u.role === "admin" ? "Demote" : "Make Admin"}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Applications Tab ── */}
      {tab === "applications" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Tracker Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update status and push milestone logs for citizen applications</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-700">All Applications ({applications.length})</p>
              </div>
              <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
                {applications.length === 0
                  ? <EmptyState icon={FileIcon} message="No applications found." />
                  : applications.map(app => (
                    <div key={app._id} onClick={() => { setSelectedApp(app); setAppProgress(app.progress); setAppStatus(app.status); }}
                      className={`px-4 py-3.5 cursor-pointer transition-all hover:bg-slate-50 ${selectedApp?._id === app._id ? "bg-blue-50 border-l-2 border-[#1a56db]" : ""}`}>
                      <p className="text-xs font-bold text-slate-900 truncate">{app.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{app.department}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <StatusPill status={app.status} />
                        <span className="text-[10px] font-bold text-[#1a56db]">{app.progress}%</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedApp ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Updating</p>
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedApp.department} · Ref: {selectedApp.referenceNumber}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Current Progress</span>
                      <span className="text-[#1a56db] font-bold">{appProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1a56db] rounded-full transition-all" style={{ width: `${appProgress}%` }} />
                    </div>
                  </div>
                  <form onSubmit={handleUpdateApplication} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
                        <select value={appStatus} onChange={e => setAppStatus(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] bg-white">
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="action_required">Action Required</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Progress ({appProgress}%)</label>
                        <input type="range" min="0" max="100" value={appProgress} onChange={e => setAppProgress(e.target.value)}
                          className="w-full mt-2 accent-[#1a56db]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Timeline Log Message</label>
                      <textarea value={timelineDesc} onChange={e => setTimelineDesc(e.target.value)} rows={3} required
                        placeholder="e.g. Documents verified. Application forwarded to senior officer."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#1a56db] resize-none" />
                    </div>
                    <button type="submit" disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60">
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                      Push Milestone Update
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex items-center justify-center py-24">
                  <EmptyState icon={FileIcon} message="Select an application to manage." />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Documents Tab ── */}
      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Document Compliance Directory</h2>
              <p className="text-xs text-slate-400 mt-0.5">{documents.length} documents in system</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={docSearch} onChange={e => setDocSearch(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1a56db] w-64 bg-white" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">File</th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Summary</th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Uploaded</th>
                    <th className="px-5 py-3.5 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDocs.length === 0
                    ? <tr><td colSpan="4"><EmptyState icon={FolderOpen} message="No documents found." /></td></tr>
                    : filteredDocs.map(doc => (
                      <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <FileIcon className="w-4 h-4 text-red-500 shrink-0" />
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="font-bold text-slate-900 hover:text-[#1a56db] hover:underline truncate max-w-[180px]">
                              {doc.fileName}
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{doc.summary || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-400">{new Date(doc.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-3.5 text-right">
                          <select value={doc.status} onChange={e => handleUpdateDocStatus(doc._id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold outline-none focus:border-[#1a56db]">
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="incomplete">Incomplete</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  }
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
            <h2 className="text-lg font-bold text-slate-900">Send Broadcast Notification</h2>
            <p className="text-xs text-slate-400 mt-0.5">Send a notification to all registered citizens</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <form onSubmit={handleSendNotification} className="space-y-4">
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
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a56db] bg-white">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={notifLoading || users.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60">
                  {notifLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send to All Users ({users.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Reports & Analytics</h2>
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
      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900">System Settings</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
            {[
              { label: "Application Name", value: "BureauAI — Bharat Sarkar Portal", desc: "The public name of this platform" },
              { label: "API Base URL", value: API, desc: "Backend API endpoint" },
              { label: "AI Model", value: "llama-3.3-70b-versatile (Groq)", desc: "Active AI model for all assistant features" },
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
      {tab === "audit" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Audit Logs</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">Recent System Events</p>
              <button onClick={fetchAdminData} className="flex items-center gap-1.5 text-[10px] font-bold text-[#1a56db] hover:underline">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                ...applications.slice(0, 5).map(a => ({ type: "application", msg: `Application "${a.title}" — status: ${a.status}`, time: a.updatedAt || a.createdAt })),
                ...documents.slice(0, 5).map(d => ({ type: "document", msg: `Document "${d.fileName}" uploaded — status: ${d.status}`, time: d.createdAt })),
                ...users.slice(0, 5).map(u => ({ type: "user", msg: `User "${u.name}" registered (${u.role})`, time: u.createdAt })),
              ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20).map((log, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      log.type === "application" ? "bg-[#1a56db]" : log.type === "document" ? "bg-violet-500" : "bg-emerald-500"
                    }`} />
                    <p className="text-xs text-slate-700 font-medium">{log.msg}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-4">
                    {new Date(log.time).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {applications.length === 0 && documents.length === 0 && users.length === 0 &&
                <EmptyState icon={ListTodo} message="No audit events yet." />
              }
            </div>
          </div>
        </div>
      )}

      {/* ── CMS / Services Tab ── */}
      {(tab === "cms" || tab === "services") && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900">{tab === "cms" ? "CMS Management" : "Services"}</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileCode className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">Coming Soon</p>
            <p className="text-xs text-slate-400 mt-1">This section is under development.</p>
          </div>
        </div>
      )}

    </div>
  );
}
