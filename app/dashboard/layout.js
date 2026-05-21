"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CommandPalette from "@/components/CommandPalette";
import {
  Home,
  FileText,
  Grid,
  Bell,
  FolderOpen,
  HelpCircle,
  User,
  Mic,
  Search,
  ChevronDown,
  LogOut,
  Settings
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
    if (stored && ["en", "hi", "mr", "ur"].includes(stored)) {
      setTimeout(() => setLanguageState(stored), 0);
    }
  }, []);

  const setLanguage = (lang) => {
    localStorage.setItem("bureau_language", lang);
    setLanguageState(lang);
  };

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`${API}/api/auth/me`, FETCH_OPTS);
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        if (data.user?.role === "admin") {
          router.replace("/admin");
          return;
        }
        setUser(data.user);
        
        // Sync language state with user preference if present
        if (data.user?.language && ["en", "hi", "mr", "ur"].includes(data.user.language)) {
          setLanguageState(data.user.language);
          localStorage.setItem("bureau_language", data.user.language);
        }

        const notifRes = await fetch(`${API}/api/notifications`, FETCH_OPTS);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
        }
        setLoading(false);
      } catch {
        router.push("/login");
      }
    }
    initSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", ...FETCH_OPTS });
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { name: t("nav_dashboard"), path: "/dashboard", icon: Home },
    { name: t("nav_my_applications"), path: "/dashboard/tracker", icon: FileText },
    { name: t("nav_services"), path: "/dashboard/eligibility", icon: Grid },
    { name: t("nav_notifications"), path: "/dashboard/notifications", icon: Bell, badge: notifications.filter(n => !n.read).length || null },
    { name: t("nav_documents"), path: "/dashboard/upload", icon: FolderOpen },
    { name: t("nav_help_support"), path: "/dashboard/chat", icon: HelpCircle },
    { name: t("nav_profile"), path: "/dashboard/settings", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a56db] flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500 font-sans">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <UserContext.Provider value={{ user, setUser, notifications, setNotifications, language, setLanguage }}>
      {/* Full-height flex container — sidebar + main side by side, NO vertical scroll on container */}
      <div className="h-screen flex overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">

        <CommandPalette />

        {/* Sidebar Desktop — fixed height, no page scroll */}
        <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0 bg-white border-r border-slate-200/80 overflow-hidden">
          <SidebarContent user={user} navLinks={navLinks} pathname={pathname} handleLogout={handleLogout} t={t} />
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative flex flex-col w-60 bg-white border-r border-slate-200 z-50 animate-slide-in">
              <SidebarContent user={user} navLinks={navLinks} pathname={pathname} handleLogout={handleLogout} t={t} />
            </aside>
          </div>
        )}

        {/* Main Workspace — scrollable independently */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header — sticky at top of main area */}
          <header className="flex-shrink-0 bg-white border-b border-slate-200/60 px-5 py-3 flex items-center justify-between z-20">

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 mr-3"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                {t("welcome_back")}, <span className="text-[#1a56db]">{user?.name?.split(" ")[0] || "Citizen"}</span> 👋
              </h2>
              <p className="text-[10px] text-slate-400 font-medium font-sans">
                {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : language === "ur" ? "ur-PK" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search services..."
                  onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k" }))}
                  className="pl-9 pr-4 py-2 w-52 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1a56db] transition-all cursor-pointer font-sans placeholder-slate-400 text-slate-800"
                />
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifPanelOpen(!notifPanelOpen)}
                  className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {notifPanelOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-0 z-50 animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <h4 className="font-bold text-slate-800 text-xs">Notifications</h4>
                      <span className="text-[10px] bg-blue-50 text-[#1a56db] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        {unreadCount} Unread
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <p className="text-center py-8 text-xs text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 6).map((notif, i) => (
                          <div key={notif._id || i} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] flex-shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100">
                      <Link href="/dashboard/notifications" className="text-xs text-[#1a56db] font-bold hover:underline" onClick={() => setNotifPanelOpen(false)}>
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "user")}`}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-slate-800 font-sans">{user?.name?.split(" ")[0] || "User"}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5 z-50">
                    <Link href="/dashboard/settings" onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                      <Settings className="w-3.5 h-3.5 text-slate-400" /> Account Settings
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-5">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </div>
    </UserContext.Provider>
  );
}

function SidebarContent({ user, navLinks, pathname, handleLogout, t }) {
  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Emblem & Logo Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#1a56db] rounded-lg shadow-sm shadow-blue-500/30">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight font-sans tracking-tight">BureauAI</div>
          <p className="text-[10px] text-slate-400 font-medium font-sans leading-none mt-0.5">Bharat Sarkar Portal</p>
        </div>
      </div>

      {/* User mini-card */}
      <div className="mx-3 mt-4 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 flex-shrink-0">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "user")}`}
          alt="avatar"
          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Citizen"}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">{t("main_menu")}</p>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? "bg-[#1a56db] text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="font-sans flex-1">{link.name}</span>
              {link.badge > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                }`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Speak with AI Button */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <Link href="/dashboard/chat">
          <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1a56db] to-blue-600 text-white hover:from-blue-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 text-xs font-bold font-sans shadow-sm shadow-blue-500/20">
            <Mic className="w-3.5 h-3.5" />
            <span>{t("nav_speak_ai")}</span>
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full mt-2 py-2 px-4 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t("nav_sign_out")}
        </button>
      </div>
    </div>
  );
}
