"use client";

import React, { useState, useEffect } from "react";
import {
  Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2,
  Inbox, Filter, RefreshCw
} from "lucide-react";
import { useUser } from "../layout";

const API = process.env.NEXT_PUBLIC_API_URL;

const TYPE_CONFIG = {
  info:    { icon: Info,          bg: "bg-blue-50",    border: "border-blue-100",   icon_color: "text-[#1a56db]",  badge: "bg-blue-50 text-[#1a56db] border-blue-100" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50",   border: "border-amber-100",  icon_color: "text-amber-500",  badge: "bg-amber-50 text-amber-600 border-amber-100" },
  success: { icon: CheckCircle2,  bg: "bg-emerald-50", border: "border-emerald-100",icon_color: "text-emerald-500",badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { notifications, setNotifications } = useUser();
  const [loading, setLoading] = useState(notifications.length === 0);
  const [filter, setFilter] = useState("all"); // all | unread | info | warning | success
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    await fetch(`${API}/api/notifications/${id}`, {
      method: "PATCH",
      credentials: "include",
    });
  }

  async function deleteOne(id) {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    await fetch(`${API}/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async function markAllRead() {
    setActionLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch(`${API}/api/notifications`, {
      method: "PATCH",
      credentials: "include",
    });
    setActionLoading(false);
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "info" || filter === "warning" || filter === "success") return n.type === filter;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const FILTERS = [
    { key: "all",     label: "All" },
    { key: "unread",  label: "Unread" },
    { key: "info",    label: "Info" },
    { key: "warning", label: "Warnings" },
    { key: "success", label: "Success" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-[#1a56db] text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay updated on your applications and services</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a56db] text-white text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filter === f.key
                ? "bg-[#1a56db] text-white border-[#1a56db] shadow-sm shadow-blue-500/20"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === "unread" ? "bg-white/20 text-white" : "bg-red-500 text-white"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600">No notifications</p>
            <p className="text-xs text-slate-400">
              {filter === "unread" ? "You're all caught up!" : "Nothing here yet."}
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div
                key={notif._id}
                onClick={() => !notif.read && markOneRead(notif._id)}
                className={`group relative bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                  notif.read
                    ? "border-slate-100"
                    : "border-[#1a56db]/20 shadow-sm shadow-blue-500/5"
                }`}
              >
                {/* Unread indicator strip */}
                {!notif.read && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#1a56db] rounded-r-full" />
                )}

                <div className="flex items-start gap-4 p-4 pl-5">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border}`}>
                    <Icon className={`w-4.5 h-4.5 ${cfg.icon_color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs font-bold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                          {notif.title}
                        </p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${cfg.badge}`}>
                          {notif.type}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${notif.read ? "text-slate-400" : "text-slate-600"}`}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markOneRead(notif._id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56db] hover:bg-blue-50 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteOne(notif._id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-[10px] text-slate-400 font-medium pb-2">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}

    </div>
  );
}
