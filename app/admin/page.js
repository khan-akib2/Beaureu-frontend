"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Users as UsersIcon,
  FileText as FileIcon,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Grid as GridIcon,
  Settings as SettingsIcon,
  ListTodo,
  Send,
  Loader2,
  Trash2,
  FolderOpen,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("documents");
  const [analytics, setAnalytics] = useState({
    usersCount: 24532,
    docsCount: 45231,
    approvedCount: 32123,
    pendingCount: 8432,
    rejectedCount: 4676
  });

  // Data lists
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);

  // Administrative Control State
  const [selectedApp, setSelectedApp] = useState(null);
  const [appProgress, setAppProgress] = useState(0);
  const [appStatus, setAppStatus] = useState("under_review");
  const [timelineDesc, setTimelineDesc] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) {
          setAnalytics({
            usersCount: data.analytics.usersCount || 24532,
            docsCount: data.analytics.docsCount || 45231,
            approvedCount: data.analytics.approvedCount || 32123,
            pendingCount: data.analytics.pendingCount || 8432,
            rejectedCount: data.analytics.rejectedCount || 4676
          });
        }
        setUsers(data.users || []);
        setDocuments(data.documents || []);
        setApplications(data.applications || []);
        if (data.applications && data.applications.length > 0) {
          setSelectedApp(data.applications[0]);
          setAppProgress(data.applications[0].progress);
          setAppStatus(data.applications[0].status);
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Update Document Status
  const handleUpdateDocStatus = async (docId, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/documents`, { credentials: "include", 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: docId, status: newStatus })
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d._id === docId ? { ...d, status: newStatus } : d))
        );
        triggerToast("Document status compliance updated successfully.");
      } else {
        triggerToast("Failed to update status compliance.", "error");
      }
    } catch {
      triggerToast("Error updating document status.", "error");
    }
  };

  // Update Application Progress / Milestone Timeline
  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications`, { credentials: "include", 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId: selectedApp._id,
          status: appStatus,
          progress: Number(appProgress),
          timelineDescription: timelineDesc || `Application status updated to ${appStatus.replace("_", " ")}.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedApp._id ? data.application : a))
        );
        setSelectedApp(data.application);
        setTimelineDesc("");
        triggerToast("Application tracker logs updated successfully.");
      } else {
        triggerToast(data.error || "Milestone logs update failed.", "error");
      }
    } catch {
      triggerToast("Error updating application tracker.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to terminate this user profile? All linked files will be removed.")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        triggerToast("Citizen account terminated successfully.");
      } else {
        triggerToast("Failed to delete user account.", "error");
      }
    } catch {
      triggerToast("Error deleting user account.", "error");
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "citizen" : "admin";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, { credentials: "include", 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );
        triggerToast(`Role toggled to ${nextRole.toUpperCase()}.`);
      } else {
        triggerToast("Failed to toggle role.", "error");
      }
    } catch {
      triggerToast("Error toggling role permissions.", "error");
    }
  };

  const selectAppDetails = (app) => {
    setSelectedApp(app);
    setAppProgress(app.progress);
    setAppStatus(app.status);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700">Approved</span>;
      case "Pending":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600">Pending</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600">In Progress</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton-shimmer rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-80 col-span-2 skeleton-shimmer rounded-xl" />
          <div className="h-80 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 z-50 fixed bottom-5 right-5 shadow-lg animate-slide-in ${
          toastType === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-750" 
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 5-Column Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4.5">
        
        {/* Card 1: Total Users */}
        <Card className="bg-white border border-slate-200/80 p-4 shadow-xs" hover={false}>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" /> 12.5%
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analytics.usersCount.toLocaleString()}</h3>
            <button onClick={() => { setActiveTab("users"); setShowAdminConsole(true); }} className="text-[9px] font-bold text-[#1a56db] hover:underline block text-left">
              View all users
            </button>
          </CardContent>
        </Card>

        {/* Card 2: Total Applications */}
        <Card className="bg-white border border-slate-200/80 p-4 shadow-xs" hover={false}>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
              <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" /> 8.2%
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analytics.docsCount.toLocaleString()}</h3>
            <button onClick={() => { setActiveTab("applications"); setShowAdminConsole(true); }} className="text-[9px] font-bold text-[#1a56db] hover:underline block text-left">
              View all applications
            </button>
          </CardContent>
        </Card>

        {/* Card 3: Approved */}
        <Card className="bg-white border border-slate-200/80 p-4 shadow-xs" hover={false}>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</span>
              <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" /> 10.1%
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analytics.approvedCount.toLocaleString()}</h3>
            <button onClick={() => { setActiveTab("documents"); setShowAdminConsole(true); }} className="text-[9px] font-bold text-[#1a56db] hover:underline block text-left">
              View reports
            </button>
          </CardContent>
        </Card>

        {/* Card 4: Pending */}
        <Card className="bg-white border border-slate-200/80 p-4 shadow-xs" hover={false}>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
              <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                <TrendingUp className="w-3.5 h-3.5" /> 5.4%
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analytics.pendingCount.toLocaleString()}</h3>
            <button onClick={() => { setActiveTab("applications"); setShowAdminConsole(true); }} className="text-[9px] font-bold text-[#1a56db] hover:underline block text-left">
              View pending
            </button>
          </CardContent>
        </Card>

        {/* Card 5: Rejected */}
        <Card className="bg-white border border-slate-200/80 p-4 shadow-xs" hover={false}>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</span>
              <div className="flex items-center gap-0.5 text-xs font-bold text-rose-600">
                <TrendingDown className="w-3.5 h-3.5" /> 2.1%
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analytics.rejectedCount.toLocaleString()}</h3>
            <button onClick={() => { setActiveTab("documents"); setShowAdminConsole(true); }} className="text-[9px] font-bold text-[#1a56db] hover:underline block text-left">
              View rejected
            </button>
          </CardContent>
        </Card>

      </div>

      {/* ── Middle Split Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Application Overview & Applications by Service charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Application Overview */}
          <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Application Overview</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1a56db]" /> Total</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* High-Fidelity SVG Line Chart */}
              <div className="w-full h-48 select-none">
                <svg className="w-full h-full" viewBox="0 0 500 180" fill="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="50" x2="480" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Left Axes Numbers */}
                  <text x="15" y="24" className="text-[9px] font-bold fill-slate-400 font-sans">10K</text>
                  <text x="15" y="54" className="text-[9px] font-bold fill-slate-400 font-sans">8K</text>
                  <text x="15" y="84" className="text-[9px] font-bold fill-slate-400 font-sans">6K</text>
                  <text x="15" y="114" className="text-[9px] font-bold fill-slate-400 font-sans">4K</text>
                  <text x="15" y="144" className="text-[9px] font-bold fill-slate-400 font-sans">2K</text>

                  {/* Datapoints / Lines */}
                  {/* Blue line: Total */}
                  <path d="M 40 85 Q 110 50 180 70 T 320 85 T 480 60" fill="none" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Green line: Approved */}
                  <path d="M 40 100 Q 110 75 180 95 T 320 105 T 480 80" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  {/* Red line: Rejected */}
                  <path d="M 40 135 Q 110 120 180 130 T 320 125 T 480 130" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Dots for 15 May highlight */}
                  <circle cx="250" cy="78" r="4.5" className="fill-[#1a56db] stroke-white stroke-2" />
                  <circle cx="250" cy="100" r="4.5" className="fill-[#10b981] stroke-white stroke-2" />

                  {/* X-Axis dates */}
                  <text x="40" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">12 May</text>
                  <text x="113" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">13 May</text>
                  <text x="186" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">14 May</text>
                  <text x="259" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">15 May</text>
                  <text x="332" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">16 May</text>
                  <text x="405" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">17 May</text>
                  <text x="478" y="165" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">18 May</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Applications by Service */}
          <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-bold text-slate-900">Applications by Service</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col sm:flex-row items-center justify-around gap-6">
              
              {/* SVG Donut Chart representation */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  
                  {/* Segment 1: Aadhaar Services 35% */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1a56db" strokeWidth="3.5" 
                    strokeDasharray="35 65" strokeDashoffset="0" />
                  
                  {/* Segment 2: Passport Services 25% */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#06b6d4" strokeWidth="3.5" 
                    strokeDasharray="25 75" strokeDashoffset="-35" />

                  {/* Segment 3: PAN Services 20% */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f97316" strokeWidth="3.5" 
                    strokeDasharray="20 80" strokeDashoffset="-60" />

                  {/* Segment 4: Driving License 10% */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#a855f7" strokeWidth="3.5" 
                    strokeDasharray="10 90" strokeDashoffset="-80" />

                  {/* Segment 5: Others 10% */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3.5" 
                    strokeDasharray="10 90" strokeDashoffset="-90" />
                </svg>
                
                {/* Center text inside donut */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-extrabold text-slate-800 tracking-tight">45,231</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Total</span>
                </div>
              </div>

              {/* Chart Legend list */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-bold text-slate-650 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#1a56db]" />
                  <span>Aadhaar Services</span>
                  <span className="ml-auto text-slate-400">35%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" />
                  <span>Passport Services</span>
                  <span className="ml-auto text-slate-400">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" />
                  <span>PAN Services</span>
                  <span className="ml-auto text-slate-400">20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]" />
                  <span>Driving License</span>
                  <span className="ml-auto text-slate-400">10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                  <span>Others</span>
                  <span className="ml-auto text-slate-400">10%</span>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right 1 Column: Recent Applications table */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-slate-200/80 shadow-xs h-full flex flex-col" hover={false}>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-100 font-sans text-xs">
                
                {/* Row 1 */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">APP123456789</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-amber-50 text-amber-600">In Progress</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Passport Renewal · Rahul Sharma</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">18 May 2024</span>
                </div>

                {/* Row 2 */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">APP987654321</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-50 text-emerald-700">Approved</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Aadhaar Update · Priya Patel</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">18 May 2024</span>
                </div>

                {/* Row 3 */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">APP564738291</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-amber-50 text-amber-650">Pending</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">PAN Card · Amit Kumar</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">18 May 2024</span>
                </div>

                {/* Row 4 */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">APP92837465</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-50 text-emerald-750">Approved</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Driving License · Neha Singh</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">17 May 2024</span>
                </div>

                {/* Row 5 */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">APP564738292</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-rose-50 text-rose-600">Rejected</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Income Certificate · Vikram Joshi</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">17 May 2024</span>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ── Bottom Grid: Quick Management Links ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        
        {/* Manage Users */}
        <button 
          onClick={() => { setActiveTab("users"); setShowAdminConsole(true); }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <UsersIcon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Manage Users</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">Add, edit and manage users</p>
        </button>

        {/* Manage Services */}
        <button 
          onClick={() => { setActiveTab("documents"); setShowAdminConsole(true); }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <GridIcon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Manage Services</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">Add, edit and manage services</p>
        </button>

        {/* Generate Reports */}
        <button 
          onClick={() => window.print()}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileIcon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Generate Reports</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">Download system reports</p>
        </button>

        {/* System Settings */}
        <button 
          onClick={() => { setActiveTab("applications"); setShowAdminConsole(true); }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">System Settings</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">Configure system settings</p>
        </button>

        {/* Audit Logs */}
        <button 
          onClick={() => { setActiveTab("documents"); setShowAdminConsole(true); }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ListTodo className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Audit Logs</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">View system audit logs</p>
        </button>

        {/* Send Notification */}
        <button 
          onClick={() => { setActiveTab("applications"); setShowAdminConsole(true); }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#1a56db] hover:shadow-md hover:shadow-blue-500/5 transition-all text-left space-y-1.5 group outline-none"
        >
          <div className="p-2.5 bg-blue-50 text-[#1a56db] rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Send className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Send Notification</h4>
          <p className="text-[9px] text-slate-400 font-medium leading-none">Send announcements</p>
        </button>

      </div>

      {/* ── Collapsible Administrative Operations Panel (State Management) ── */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowAdminConsole(!showAdminConsole)}
          className="w-full flex items-center justify-between py-3 px-5 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100/50 transition-all outline-none"
        >
          <div className="flex items-center gap-2.5 font-bold text-xs text-[#1a56db]">
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Interactive Operations Console ({showAdminConsole ? "Hide" : "Expand"})</span>
          </div>
          <Badge variant="warning">Citizen Auditing Controls</Badge>
        </button>

        {showAdminConsole && (
          <div className="mt-5 space-y-6 animate-slide-up">
            
            {/* Tabs Selector */}
            <div className="flex gap-2 border-b border-slate-250 pb-px">
              {[
                { id: "documents", label: "Documents compliance directory", count: documents.length },
                { id: "applications", label: "Application Trackers log", count: applications.length },
                { id: "users", label: "Citizen database", count: users.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 outline-none transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-[#1a56db] text-[#1a56db] font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="min-h-96">
              
              {/* Tab 1: Documents Directory */}
              {activeTab === "documents" && (
                <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-slate-450 font-bold bg-slate-50/50">
                          <th className="px-6 py-4">Filing Details</th>
                          <th className="px-6 py-4">Citizen User</th>
                          <th className="px-6 py-4">Added Date</th>
                          <th className="px-6 py-4">AI Audit Report</th>
                          <th className="px-6 py-4 text-right">Status Compliance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-655">
                        {documents.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-slate-400 font-sans">
                              No user documents found in system directory.
                            </td>
                          </tr>
                        ) : (
                          documents.map((doc) => (
                            <tr key={doc._id} className="hover:bg-slate-50/30">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                  <FileIcon className="w-4 h-4 text-red-600" />
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-slate-900">
                                    {doc.fileName}
                                  </a>
                                </div>
                              </td>
                              <td className="px-6 py-4">{doc.userId?.name || "System Seed"}</td>
                              <td className="px-6 py-4">{new Date(doc.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 truncate max-w-xs text-slate-400 font-medium">{doc.summary}</td>
                              <td className="px-6 py-4 text-right">
                                <select
                                  value={doc.status}
                                  onChange={(e) => handleUpdateDocStatus(doc._id, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-350 bg-white text-slate-800 text-[10px] font-bold focus:border-[#1a56db] outline-none"
                                >
                                  <option value="pending">Pending Audit</option>
                                  <option value="verified">Verified Compliance</option>
                                  <option value="incomplete">Incomplete Scan</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* Tab 2: Applications milestone adjustments */}
              {activeTab === "applications" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* List */}
                  <div className="lg:col-span-1">
                    <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
                      <CardContent className="p-4 space-y-2.5 max-h-[460px] overflow-y-auto">
                        {applications.length === 0 ? (
                          <p className="text-center text-slate-400 py-6">No tracked applications.</p>
                        ) : (
                          applications.map((app) => (
                            <div
                              key={app._id}
                              onClick={() => selectAppDetails(app)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedApp?._id === app._id
                                  ? "border-blue-400 bg-blue-50 text-[#1a56db]"
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <h4 className="text-xs font-bold truncate text-slate-900">{app.title}</h4>
                                <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-medium">{app.department}</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1a56db]">
                                {app.progress}%
                              </span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Adjustments Form details */}
                  <div className="lg:col-span-2">
                    {selectedApp ? (
                      <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-slate-900">Push Timeline Milestone</CardTitle>
                        <CardDescription className="text-xs font-semibold">Update citizen checklist for: <strong>{selectedApp.title}</strong></CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <form onSubmit={handleUpdateApplication} className="space-y-5">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="flex flex-col gap-1.5 w-full">
                              <label htmlFor="admin-status" className="text-xs font-bold text-slate-400 uppercase">Application State</label>
                              <select
                                id="admin-status"
                                value={appStatus}
                                onChange={(e) => setAppStatus(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:border-[#1a56db] outline-none"
                              >
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="action_required">Action Required (Flags)</option>
                                <option value="approved">Approved & Resolved</option>
                                <option value="rejected">Rejected / Hold</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-xs font-bold text-slate-400 uppercase">Milestone Progress ({appProgress}%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={appProgress}
                                onChange={(e) => setAppProgress(e.target.value)}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-4"
                              />
                            </div>

                          </div>

                          <div className="flex flex-col gap-1.5 w-full">
                            <label htmlFor="admin-timeline" className="text-xs font-bold text-slate-400 uppercase">New Timeline Log Message</label>
                            <textarea
                              id="admin-timeline"
                              value={timelineDesc}
                              onChange={(e) => setTimelineDesc(e.target.value)}
                              placeholder="e.g. Document verified. Passport sent for police inquiry."
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold outline-none focus:border-[#1a56db] resize-none"
                              required
                            />
                          </div>

                          <Button type="submit" isLoading={actionLoading} className="bg-[#1a56db] hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                            Submit Milestone Update
                          </Button>

                        </form>
                      </CardContent>
                    </Card>
                    ) : (
                      <Card hover={false} className="bg-white border border-slate-200/80 py-20 text-center">
                        <CardContent>
                          <FolderOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-xs text-slate-400 font-semibold">Select an application from the side list to push updates.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Users Database */}
              {activeTab === "users" && (
                <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-slate-450 font-bold bg-slate-50/50">
                          <th className="px-6 py-4">Citizen Name</th>
                          <th className="px-6 py-4">Email Address</th>
                          <th className="px-6 py-4">Role Permission</th>
                          <th className="px-6 py-4">Register Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-655">
                        {users.map((citizen) => (
                          <tr key={citizen._id} className="hover:bg-slate-50/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={citizen.avatar} alt="Avatar" className="w-8 h-8 rounded-full border bg-slate-100 object-cover" />
                                <span className="font-bold text-slate-900">{citizen.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{citizen.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                citizen.role === "admin" 
                                  ? "bg-red-50 text-red-650" 
                                  : "bg-blue-50 text-[#1a56db]"
                              }`}>
                                {citizen.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{new Date(citizen.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleToggleUserRole(citizen._id, citizen.role)}
                                className="px-3 py-1.5 text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                Toggle Role
                              </button>
                              <button
                                onClick={() => handleDeleteUser(citizen._id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
