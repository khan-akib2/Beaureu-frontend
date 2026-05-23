"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CommandPalette from "@/components/CommandPalette";
import DashboardIframe from "@/components/DashboardIframe";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  FileCheck2,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  X
} from "lucide-react";
import { TRANSLATIONS } from "../../lib/translations";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

const API = process.env.NEXT_PUBLIC_API_URL;
const FETCH_OPTS = { credentials: "include" };

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("bureau_language");
    if (stored && ["en", "hi", "mr", "ur", "bn"].includes(stored)) {
      setTimeout(() => setLanguageState(stored), 0);
    }
  }, []);

  const setLanguage = (lang) => {
    localStorage.setItem("bureau_language", lang);
    setLanguageState(lang);
  };

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`${API}/api/auth/me`, FETCH_OPTS);
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (data.user?.role === "admin") {
          router.replace("/admin");
          return;
        }
        setUser(data.user);
        if (data.user?.language && ["en", "hi", "mr", "ur", "bn"].includes(data.user.language)) {
          setLanguageState(data.user.language);
          localStorage.setItem("bureau_language", data.user.language);
        }

        const notifRes = await fetch(`${API}/api/notifications`, FETCH_OPTS);
        if (notifRes.ok) {
          const notifData = await notifRes.json().catch(() => ({}));
          setNotifications(notifData.notifications || []);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const notifRes = await fetch(`${API}/api/notifications`, FETCH_OPTS);
        if (notifRes.ok) {
          const notifData = await notifRes.json().catch(() => ({}));
          setNotifications(notifData.notifications || []);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", ...FETCH_OPTS });
    router.push("/login");
    router.refresh();
  };

  const handleMarkAsRead = async (notifId) => {
    if (!notifId) return;
    setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, read: true } : n)));
    await fetch(`${API}/api/notifications/${notifId}`, { method: "PATCH", ...FETCH_OPTS }).catch(() => {});
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "AI Assistant", path: "/dashboard/chat", icon: Bot },
    { name: "Services", path: "/dashboard/eligibility", icon: BriefcaseBusiness },
    { name: "Document Verification", path: "/dashboard/upload", icon: ShieldCheck },
    { name: "Applications", path: "/dashboard/tracker", icon: FileText },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell, badge: notifications.filter((n) => !n.read).length || null },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Verifying citizen session...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, notifications, setNotifications, language, setLanguage }}>
      <div className="h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        <CommandPalette />
        <div className="flex h-full min-h-0 gap-6 p-4 lg:p-6">
          <aside className="hidden lg:flex w-[276px] shrink-0">
            <SidebarContent user={user} navLinks={navLinks} pathname={pathname} handleLogout={handleLogout} />
          </aside>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button className="absolute inset-0 bg-slate-950/30" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" />
                <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ duration: 0.2 }} className="relative h-full w-[292px] p-3">
                  <SidebarContent user={user} navLinks={navLinks} pathname={pathname} handleLogout={handleLogout} />
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex min-h-0 flex-1 flex-col">
            <header className="relative z-30 mb-6 shrink-0 rounded-[24px] border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 rounded-2xl border border-slate-200 text-slate-500" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B]">Citizen Workspace</p>
                  <h1 className="text-lg font-extrabold tracking-tight text-[#0F172A]">Welcome back, {user?.name?.split(" ")[0] || "Citizen"}</h1>
                </div>

                <button
                  onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k" }))}
                  className="hidden md:flex min-w-[260px] items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-[#64748B] transition hover:border-blue-200 hover:bg-white"
                >
                  <Search className="w-4 h-4" />
                  Search services, schemes, documents
                </button>

                <div className="relative">
                  <button onClick={() => setNotifPanelOpen((v) => !v)} className="relative rounded-2xl border border-[#E5E7EB] bg-white p-3 text-[#64748B] transition hover:text-[#1D4ED8] hover:shadow-sm" aria-label="Notifications">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F59E0B] ring-2 ring-white" />}
                  </button>
                  {notifPanelOpen && (
                    <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <span className="text-sm font-bold">Notifications</span>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#1D4ED8]">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-[#64748B]">No notifications yet.</p>
                        ) : notifications.slice(0, 6).map((notif, index) => (
                          <button key={notif._id || index} onClick={() => handleMarkAsRead(notif._id)} className="block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-[#F8FAFC]">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-bold text-[#0F172A]">{notif.title}</p>
                              {!notif.read && <span className="h-2 w-2 rounded-full bg-[#1D4ED8]" />}
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">{notif.message}</p>
                          </button>
                        ))}
                      </div>
                      <Link href="/dashboard/notifications" onClick={() => setNotifPanelOpen(false)} className="block px-4 py-3 text-xs font-bold text-[#1D4ED8] hover:bg-blue-50">View all notifications</Link>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowDropdown((v) => !v)} className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white py-1.5 pl-1.5 pr-3 transition hover:shadow-sm">
                    <img src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "citizen")}`} alt="" className="h-9 w-9 rounded-xl border border-slate-200 object-cover" />
                    <span className="hidden text-sm font-bold text-[#0F172A] sm:inline">{user?.name?.split(" ")[0] || "User"}</span>
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl">
                      <Link href="/dashboard/settings" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">
                        <User className="w-4 h-4 text-[#64748B]" /> Profile Settings
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="min-h-0 flex-1 pb-0">
              <DashboardIframe>{children}</DashboardIframe>
            </main>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

function SidebarContent({ user, navLinks, pathname, handleLogout }) {
  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col rounded-[32px] border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center gap-3 px-2 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1D4ED8]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-[#0F172A]">BureauAI</div>
          <p className="text-[11px] font-semibold text-[#64748B]">Citizen Government Assistant</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.path;
          return (
            <Link
              key={`${link.name}-${link.path}`}
              href={link.path}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition duration-200 ${
                active
                  ? "bg-[#EEF4FF] text-[#1D4ED8]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-[#1D4ED8]" : "text-[#94A3B8] group-hover:text-[#1D4ED8]"}`} />
              <span className="flex-1">{link.name}</span>
              {link.badge > 0 && <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] text-white">{link.badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[24px] bg-gradient-to-br from-[#EEF4FF] to-white p-4">
        <div className="flex items-center gap-3">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "citizen")}`} alt="" className="h-10 w-10 rounded-2xl border border-white object-cover shadow-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#0F172A]">{user?.name || "Citizen"}</p>
            <p className="truncate text-xs font-medium text-[#64748B]">{user?.email}</p>
          </div>
        </div>
        <Link href="/dashboard/chat" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3A8A]">
          <Sparkles className="h-4 w-4" /> Ask BureauAI
        </Link>
      </div>

      <button onClick={handleLogout} className="mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-[#64748B] transition hover:bg-red-50 hover:text-red-600">
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}
