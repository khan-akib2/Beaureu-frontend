"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Home,
  Users,
  FileText,
  Grid,
  BarChart3,
  FileCode,
  Bell,
  Settings,
  ListTodo,
  LogOut,
  ChevronDown,
  Calendar,
  Download,
  Menu,
  X
} from "lucide-react";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { credentials: "include" });
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        if (data.user?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setAdmin(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    verifyAdminSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { credentials: "include",  method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Users", path: "/admin?tab=users", icon: Users, hasSub: true },
    { name: "Applications", path: "/admin?tab=applications", icon: FileText, hasSub: true },
    { name: "Services", path: "/admin?tab=services", icon: Grid },
    { name: "Reports & Analytics", path: "/admin?tab=analytics", icon: BarChart3 },
    { name: "CMS Management", path: "/admin?tab=cms", icon: FileCode },
    { name: "Notifications", path: "/admin?tab=notifications", icon: Bell },
    { name: "System Settings", path: "/admin?tab=settings", icon: Settings },
    { name: "Audit Logs", path: "/admin?tab=audit", icon: ListTodo },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-350 font-sans">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Enforce role checks
  if (admin && admin.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm text-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full w-fit mx-auto mb-4">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">Access Denied</h2>
          <p className="text-xs text-slate-505 mt-2 leading-relaxed font-sans">
            Administrative access is restricted to authorized roles.
          </p>
          <div className="mt-6 flex gap-3 w-full">
            <Link href="/dashboard" className="flex-1">
              <button className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all font-sans">
                Go to Citizen Dashboard
              </button>
            </Link>
            <button onClick={handleLogout} className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-red-200 text-red-650 hover:bg-red-50 transition-all font-sans">
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ admin }}>
      <div className="h-screen flex overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">

        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-[#0a192f] overflow-hidden">
          <SidebarContent pathname={pathname} handleLogout={handleLogout} adminLinks={adminLinks} currentTab={currentTab} />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
            <aside className="relative flex flex-col w-64 bg-[#0a192f] z-50 animate-slide-in">
              <SidebarContent pathname={pathname} handleLogout={handleLogout} adminLinks={adminLinks} currentTab={currentTab} />
            </aside>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header */}
          <header className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Admin Dashboard</h2>
                <p className="text-xs text-slate-400 font-medium font-sans mt-0.5">Welcome back, Administrator</p>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all font-sans">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>12 May 2024 - 18 May 2024</span>
              </button>
              
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a192f] hover:bg-[#0b1b36] text-white rounded-xl text-xs font-bold transition-all font-sans"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </header>

          {/* Page content view */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </div>
    </AdminContext.Provider>
  );
}

function SidebarContent({ pathname, handleLogout, adminLinks, currentTab }) {
  return (
    <div className="flex flex-col h-full bg-[#0a192f] text-slate-300 font-sans select-none justify-between overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Emblem & Logo Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-lg p-1.5 border border-white/5">
            <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v4M9 3v3M15 3v3" />
              <path d="M8 6h8v2H8z" strokeLinecap="round" />
              <path d="M10 8v5M14 8v5" />
              <circle cx="12" cy="15" r="2.5" />
              <path d="M7 13h10v2a5 5 0 01-10 0v-2z" />
              <path d="M9 19v2M15 19v2M12 18v4" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Bharat Sarkar</div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Admin Portal</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="px-4 py-6 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const linkTab = new URLSearchParams(link.path.split("?")[1] || "").get("tab");
            const active = linkTab ? linkTab === currentTab : (!currentTab && pathname === "/admin");
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#1a56db] text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{link.name}</span>
                {link.hasSub && (
                  <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action at the very bottom of the sidebar */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-455 hover:text-white hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
