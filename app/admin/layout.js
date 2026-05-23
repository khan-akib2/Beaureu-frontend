"use client";

export const dynamic = "force-dynamic";

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
  X,
  Search,
  User
} from "lucide-react";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: "include" });
        if (!res.ok) { router.replace("/login"); return; }
        const data = await res.json().catch(() => ({}));
        if (data.user?.role !== "admin") {
          await fetch(`${API}/api/auth/logout`, { credentials: "include", method: "POST" }).catch(() => {});
          router.replace("/login");
          return;
        }
        setAdmin(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    verifyAdminSession();
  }, [router]);

  useEffect(() => {
    if (!admin || admin.role !== "admin") return;

    const verifyRoleStillAdmin = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.user?.role !== "admin") {
          await fetch(`${API}/api/auth/logout`, { credentials: "include", method: "POST" }).catch(() => {});
          router.replace("/login");
          router.refresh();
        }
      } catch {
        // Keep the current session on transient network errors.
      }
    };

    const interval = window.setInterval(verifyRoleStillAdmin, 10000);
    window.addEventListener("focus", verifyRoleStillAdmin);
    document.addEventListener("visibilitychange", verifyRoleStillAdmin);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", verifyRoleStillAdmin);
      document.removeEventListener("visibilitychange", verifyRoleStillAdmin);
    };
  }, [admin, router]);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { credentials: "include",  method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Users", path: "/admin?tab=users", icon: Users, hasSub: true },
    { name: "Applications", path: "/admin?tab=applications", icon: FileText, hasSub: true },
    { name: "Reports & Analytics", path: "/admin?tab=analytics", icon: BarChart3 },
    { name: "Notifications", path: "/admin?tab=notifications", icon: Bell },
    { name: "Profile Settings", path: "/admin?tab=profile", icon: User },
    ...(admin?.email === "bureauai@gmail.com" ? [{ name: "System Settings", path: "/admin?tab=settings", icon: Settings }] : []),
    { name: "Audit Logs", path: "/admin?tab=audit", icon: ListTodo },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.jpg" alt="BureauAI Logo" className="h-12 w-auto object-contain bg-white p-1 rounded-xl shadow-lg animate-pulse" />
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
    <AdminContext.Provider value={{ admin, setAdmin }}>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
        
        {/* Tricolor National Governance Stripe */}
        <div className="shrink-0 h-[3px] w-full flex">
          <div className="flex-1 bg-[#d97706]"></div> {/* Saffron */}
          <div className="flex-1 bg-white"></div> {/* White */}
          <div className="flex-1 bg-[#059669]"></div> {/* Green */}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-[#0a192f] overflow-hidden border-r border-slate-800/40">
            <React.Suspense fallback={<div className="h-full bg-[#0a192f]" />}>
              <SidebarContent pathname={pathname} handleLogout={handleLogout} adminLinks={adminLinks} />
            </React.Suspense>
          </aside>

          {/* Mobile Drawer */}
          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
              <aside className="relative flex flex-col w-64 bg-[#0a192f] z-50 animate-slide-in">
                <React.Suspense fallback={<div className="h-full bg-[#0a192f]" />}>
                  <SidebarContent pathname={pathname} handleLogout={handleLogout} adminLinks={adminLinks} />
                </React.Suspense>
              </aside>
            </div>
          )}

          {/* Main Content Workspace */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* Header */}
            <header className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between z-20 shadow-xs">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:block">
                  <h2 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">Admin Dashboard</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">BureauAI Ops Control</p>
                </div>
              </div>

              {/* Admin Profile Info */}
              {admin && (
                <Link href="/admin?tab=profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{admin.name}</p>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase mt-1 leading-none">{admin.role}</p>
                  </div>
                  <img 
                    src={admin.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(admin.name)}`}
                    alt="Admin Avatar"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 object-cover"
                  />
                </Link>
              )}
            </header>

          {/* Page content view */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
    </AdminContext.Provider>
  );
}

function SidebarContent({ pathname, handleLogout, adminLinks }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  return (
    <div className="flex flex-col h-full bg-[#0a192f] text-slate-300 font-sans select-none justify-between overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Emblem & Logo Header */}
        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center bg-slate-950/20">
          <img src="/logo.jpg" alt="BureauAI Logo" className="h-9 w-auto object-contain bg-white p-1 rounded-xl" />
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
