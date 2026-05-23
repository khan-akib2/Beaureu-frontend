"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  Lightbulb,
  LineChart,
  ScrollText,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const FETCH_OPTS = { credentials: "include" };

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.22, delay: i * 0.04 } }),
};

const softCard = "rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]";

export default function DashboardFrame() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadFrame() {
      try {
        const sessionRes = await fetch(`${API}/api/auth/me`, FETCH_OPTS);
        if (!sessionRes.ok) {
          window.parent.location.href = "/login";
          return;
        }

        const sessionData = await sessionRes.json().catch(() => ({}));
        if (sessionData.user?.role === "admin") {
          window.parent.location.href = "/admin";
          return;
        }
        setUser(sessionData.user || null);

        const [appsRes, docsRes, notifRes] = await Promise.allSettled([
          fetch(`${API}/api/applications`, FETCH_OPTS),
          fetch(`${API}/api/documents`, FETCH_OPTS),
          fetch(`${API}/api/notifications`, FETCH_OPTS),
        ]);

        if (appsRes.status === "fulfilled" && appsRes.value.ok) {
          const data = await appsRes.value.json().catch(() => ({}));
          setApps(data.applications || []);
        }
        if (docsRes.status === "fulfilled" && docsRes.value.ok) {
          const data = await docsRes.value.json().catch(() => ({}));
          setDocs(data.documents || []);
        }
        if (notifRes.status === "fulfilled" && notifRes.value.ok) {
          const data = await notifRes.value.json().catch(() => ({}));
          setNotifications(data.notifications || []);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoaded(true);
      }
    }

    loadFrame();
  }, [router]);

  const metrics = useMemo(() => {
    const active = apps.filter((a) => ["submitted", "under_review", "action_required"].includes(a.status)).length;
    const completed = apps.filter((a) => a.status === "approved").length;
    const verified = docs.filter((d) => ["verified", "approved"].includes(d.status)).length;
    return [
      { label: "Active Applications", value: active, icon: FileText, trend: "Live cases", accent: "text-[#1D4ED8]", bg: "bg-[#EEF4FF]" },
      { label: "Eligible Schemes", value: Math.max(3, active + 2), icon: Landmark, trend: "+2 matched", accent: "text-[#0F766E]", bg: "bg-teal-50" },
      { label: "Documents Verified", value: verified, icon: ShieldCheck, trend: "Audit ready", accent: "text-[#0F766E]", bg: "bg-emerald-50" },
      { label: "Requests Completed", value: completed, icon: CheckCircle2, trend: "Closed loop", accent: "text-[#F59E0B]", bg: "bg-amber-50" },
    ];
  }, [apps, docs]);

  const progress = apps.length ? Math.round((apps.filter((a) => a.status === "approved").length / apps.length) * 100) : 42;
  const recentApplications = apps.slice(0, 4);
  const recentDocs = docs.slice(0, 3);
  const unread = notifications.filter((n) => !n.read).length;

  const services = [
    { name: "Passport", icon: Building2, href: "/dashboard/tracker" },
    { name: "PAN", icon: WalletCards, href: "/dashboard/tracker" },
    { name: "Certificates", icon: ScrollText, href: "/dashboard/upload" },
    { name: "Subsidies", icon: Landmark, href: "/dashboard/eligibility" },
    { name: "Tax Services", icon: ClipboardCheck, href: "/dashboard/eligibility" },
  ];

  const activityCards = [
    {
      title: "Recent Applications",
      icon: FileText,
      rows: recentApplications.length
        ? recentApplications.map((a) => ({ primary: a.title, secondary: a.referenceNumber || "Reference pending", status: formatStatus(a.status) }))
        : [{ primary: "No active application yet", secondary: "Start a request to begin tracking", status: "Ready" }],
    },
    {
      title: "Document Audit Results",
      icon: FileCheck2,
      rows: recentDocs.length
        ? recentDocs.map((d) => ({ primary: d.fileName, secondary: d.summary || "Document received", status: formatStatus(d.status) }))
        : [{ primary: "No document audit yet", secondary: "Upload files for verification", status: "Ready" }],
    },
    {
      title: "Scheme Recommendations",
      icon: SearchCheck,
      rows: [
        { primary: "Education assistance", secondary: "Based on profile and active services", status: "Match" },
        { primary: "Citizen subsidy review", secondary: "Eligibility check available", status: "Suggested" },
      ],
    },
    {
      title: "AI Suggestions",
      icon: Lightbulb,
      rows: [
        { primary: unread ? "Review new notifications" : "Upload latest identity proof", secondary: unread ? `${unread} unread update${unread > 1 ? "s" : ""}` : "Improves service readiness", status: "Next" },
        { primary: "Check scheme eligibility", secondary: "AI can shortlist programs", status: "Helpful" },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#0F172A] font-sans antialiased">
      <motion.div className="space-y-4" initial="hidden" animate="show">
        <motion.section variants={cardVariants} className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <div className={`${softCard} overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF4FF] p-5`}>
            <div className="max-w-3xl">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-[#1D4ED8] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Administrative intelligence platform
              </p>
              <h1 className="text-2xl font-black tracking-tight text-[#0F172A] lg:text-3xl">Welcome to BureauAI</h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#64748B]">Navigate government processes with confidence.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:hidden">
              {["Trusted workflows", "Verified documents", "Guided services"].map((item) => (
                <div key={item} className="rounded-2xl border border-white bg-white/80 px-4 py-2.5 shadow-sm">
                  <p className="text-sm font-bold text-[#0F172A]">{item}</p>
                  <p className="mt-1 text-xs text-[#64748B]">Built for citizen clarity</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${softCard} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-[#0F172A]">{user?.name || "Citizen"}</p>
                <p className="text-xs font-semibold text-[#64748B]">Digital citizen profile</p>
              </div>
              <div className="rounded-2xl bg-[#EEF4FF] p-3 text-[#1D4ED8]">
                <BadgeCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Readiness score</span>
                <span>{Math.max(progress, 42)}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-[#1D4ED8] transition-all duration-500" style={{ width: `${Math.max(progress, 42)}%` }} />
              </div>
            </div>
            <Link href="/dashboard/settings" target="_parent" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#1D4ED8]">
              Review profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div key={metric.label} custom={index} variants={cardVariants} whileHover={{ y: -3 }} transition={{ duration: 0.18 }} className={`${softCard} p-3.5`}>
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl ${metric.bg} p-2.5 ${metric.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                    <TrendingUp className="h-3 w-3" /> {metric.trend}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#0F172A]">{loaded ? metric.value : "--"}</p>
                <p className="text-xs font-semibold text-[#64748B]">{metric.label}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div variants={cardVariants} className={`${softCard} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0F172A]">Start a Government Request</h2>
                <p className="mt-1 text-sm font-medium text-[#64748B]">Choose a service and BureauAI will guide the process.</p>
              </div>
              <Link href="/dashboard/tracker" target="_parent" className="hidden rounded-2xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3A8A] sm:inline-flex">
                Begin Process
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Link key={service.name} href={service.href} target="_parent" className="group min-h-[104px] rounded-2xl border border-blue-100 bg-gradient-to-br from-[#EEF4FF] to-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <Icon className="h-5 w-5 text-[#1D4ED8]" />
                    <p className="mt-2.5 text-sm font-extrabold leading-tight text-[#0F172A]">{service.name}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[#64748B]">Guided request</p>
                  </Link>
                );
              })}
            </div>
            <Link href="/dashboard/tracker" target="_parent" className="mt-5 flex items-center justify-center rounded-2xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3A8A] sm:hidden">
              Begin Process
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} className={`${softCard} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0F172A]">Citizen Insights</h2>
                <p className="mt-1 text-sm font-medium text-[#64748B]">Progress, recommendations, and service timeline.</p>
              </div>
              <div className="rounded-2xl bg-teal-50 p-3 text-[#0F766E]">
                <LineChart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                <svg viewBox="0 0 420 140" className="h-28 w-full xl:h-32" role="img" aria-label="Application progress chart">
                  <path d="M20 112 C70 88 82 96 120 62 C158 28 188 54 220 68 C262 86 286 34 326 42 C362 49 376 82 400 58" fill="none" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
                  <path d="M20 112 C70 88 82 96 120 62 C158 28 188 54 220 68 C262 86 286 34 326 42 C362 49 376 82 400 58 L400 130 L20 130 Z" fill="#EEF4FF" />
                  {[20, 120, 220, 326, 400].map((x, i) => <circle key={x} cx={x} cy={[112, 62, 68, 42, 58][i]} r="5" fill="#0F766E" />)}
                </svg>
              </div>
              <div className="space-y-2">
                {[
                  ["Application progress", `${progress}% completion confidence`],
                  ["AI recommendations", "2 next steps identified"],
                  ["Service timeline", "Estimated updates within 7 days"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] px-4 py-2.5">
                    <span className="text-sm font-bold text-[#0F172A]">{label}</span>
                    <span className="text-right text-xs font-bold text-[#64748B]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {activityCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title} custom={index} variants={cardVariants} whileHover={{ y: -3 }} transition={{ duration: 0.18 }} className={`${softCard} p-3.5`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#EEF4FF] p-2.5 text-[#1D4ED8]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black leading-tight text-[#0F172A]">{card.title}</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </div>
                <div className="space-y-2.5">
                  {card.rows.map((row) => (
                    <div key={`${card.title}-${row.primary}`} className="rounded-2xl bg-[#F8FAFC] px-4 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-bold text-[#0F172A]">{row.primary}</p>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#0F766E]">{row.status}</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-[#64748B]">{row.secondary}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </section>
      </motion.div>
    </main>
  );
}

function formatStatus(status) {
  const map = {
    approved: "Approved",
    rejected: "Rejected",
    action_required: "Action",
    submitted: "Submitted",
    under_review: "Review",
    verified: "Verified",
    incomplete: "Incomplete",
    pending: "Pending",
  };
  return map[status] || "Active";
}

