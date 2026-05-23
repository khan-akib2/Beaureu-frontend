"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  Globe2,
  Landmark,
  Languages,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FETCH_OPTS = { credentials: "include" };

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const premiumShadow = "shadow-[0_20px_60px_rgba(15,23,42,0.08)]";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API}/api/auth/me`, FETCH_OPTS);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST", ...FETCH_OPTS });
      setUser(null);
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const destination = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-white font-sans text-[#0F172A]">
      <Navbar user={user} loading={loading} destination={destination} onLogout={handleLogout} />
      <Hero user={user} loading={loading} destination={destination} onLogout={handleLogout} />
      <StatsStrip />
      <Features />
      <Services user={user} destination={destination} />
      <HowItWorks />
      <CTA user={user} loading={loading} destination={destination} onLogout={handleLogout} />
      <Footer />
    </div>
  );
}

export function Navbar({ user, loading, destination, onLogout }) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-[72px] border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img src="/logo.jpg" alt="BureauAI Logo" className="h-9 w-auto object-contain" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {[
            ["Services", "/services"],
            ["Features", "/features"],
            ["Schemes", "/schemes"],
            ["Dashboard", user ? destination : "/login"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="text-xs font-bold text-slate-600 transition-colors hover:text-[#1D4ED8]">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex min-h-9 items-center gap-2">
          {!loading && (
            user ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={onLogout}
                  className="hidden rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
                >
                  Logout
                </motion.button>
                <PrimaryLink href={destination}>Open Dashboard</PrimaryLink>
              </>
            ) : (
              <>
                <SecondaryLink href="/login">Sign In</SecondaryLink>
                <PrimaryLink href="/signup">Get Started</PrimaryLink>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero({ user, loading, destination, onLogout }) {
  const trustItems = [
    { icon: ShieldCheck, label: "Secure Authentication" },
    { icon: Landmark, label: "India Focused" },
    { icon: Zap, label: "AI Guided" },
    { icon: LockKeyhole, label: "Private by Design" },
  ];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF,#F8FAFC)] pt-[72px]">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.14),transparent_58%)]" />
      <motion.div
        animate={{ y: [0, -25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-12rem] top-24 h-[34rem] w-[34rem] rounded-full bg-blue-100/40 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-14rem] top-48 h-[28rem] w-[28rem] rounded-full bg-teal-100/30 blur-3xl pointer-events-none"
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(to right, #1D4ED8 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1400px] grid-cols-1 items-center gap-10 px-6 py-6 xl:grid-cols-[1.25fr_0.75fr]">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-[1080px]">
          <motion.div variants={fadeUp} className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-[#1D4ED8] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI assistance for Indian public services
          </motion.div>

          <motion.h1 variants={fadeUp} className="max-w-[1080px] text-[42px] font-black leading-[1.08] tracking-tight text-[#0F172A] sm:text-[48px] xl:text-[50px] 2xl:text-[56px]">
            Navigate India&apos;s
            <br />
            Government Services
            <br />
            with{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-[#1D4ED8] to-[#0F766E] bg-clip-text text-transparent">
              Intelligent Assistance
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-[600px] text-base font-medium leading-7 text-slate-600">
            BureauAI helps citizens understand documents, track applications, discover schemes, and get clear AI-guided next steps across Indian government services.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 flex min-h-[48px] flex-wrap gap-3">
            {!loading && (
              user ? (
                <>
                  <PrimaryLink href={destination} large>Go to Dashboard</PrimaryLink>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={onLogout}
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <PrimaryLink href="/signup" large>Start Free</PrimaryLink>
                  <SecondaryLink href="/login" large>Sign In to Portal</SecondaryLink>
                </>
              )
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
                  <Icon className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  {item.label}
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.3 },
            x: { duration: 0.3 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative mx-auto w-full max-w-[720px] xl:max-w-none"
        >
          <CommandCenter />
        </motion.div>
      </div>
    </section>
  );
}

function CommandCenter() {
  const metricCards = [
    { label: "Applications", value: "12", trend: "+3 this week", icon: FileText, accent: "text-[#1D4ED8]", bg: "bg-blue-50" },
    { label: "Approved", value: "8", trend: "92% confidence", icon: CheckCircle2, accent: "text-[#0F766E]", bg: "bg-teal-50" },
    { label: "Processing", value: "3", trend: "2 on schedule", icon: Clock3, accent: "text-[#F59E0B]", bg: "bg-amber-50" },
    { label: "Action Required", value: "1", trend: "Identity proof", icon: CircleAlert, accent: "text-red-600", bg: "bg-red-50" },
  ];

  const timeline = [
    ["PAN verification", "Approved", "Completed"],
    ["Passport renewal", "Police review", "In progress"],
    ["Income certificate", "Upload required", "Action"],
  ];

  return (
    <div className="relative mx-auto max-w-[620px]">
      <div className="absolute -left-8 top-16 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:block">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#0F766E]" />
        Live status synced
      </div>

      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={`rounded-[32px] border border-slate-200 bg-white p-5 ${premiumShadow}`}>
        <div className="rounded-[24px] border border-slate-200 bg-[#F8FAFC] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#1D4ED8]">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Citizen Command Center
              </div>
              <h2 className="mt-3 text-xl font-black leading-tight tracking-tight text-[#0F172A]">Interactive service intelligence</h2>
              <p className="mt-1.5 max-w-sm text-xs font-medium leading-5 text-slate-600">Monitor applications, recommended actions, and document readiness in one trusted workspace.</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1D4ED8] text-white shadow-[0_12px_30px_rgba(29,78,216,0.28)]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${card.bg} ${card.accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {card.label === "Approved" ? (
                      <div className="grid h-9 w-9 place-items-center rounded-full border-[4px] border-teal-100 border-t-[#0F766E] text-[9px] font-black text-[#0F766E]">
                        8
                      </div>
                    ) : card.label === "Processing" ? (
                      <div className="h-2 w-14 rounded-full bg-slate-100">
                        <div className="h-2 w-[66%] rounded-full bg-[#F59E0B]" />
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-2.5 text-2xl font-black leading-none text-[#0F172A]">{card.value}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-700">{card.label}</p>
                    <p className="text-[9px] font-black text-slate-400">{card.trend}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#0F172A]">Timeline progress</h3>
                <LineChart className="h-3.5 w-3.5 text-[#1D4ED8]" />
              </div>
              <div className="mt-3 space-y-2.5">
                {timeline.map(([title, subtitle, status], index) => (
                  <div key={title} className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${index === 2 ? "bg-[#F59E0B]" : "bg-[#1D4ED8]"}`} />
                      {index < timeline.length - 1 && <div className="mt-0.5 h-6 w-px bg-slate-200" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-[#0F172A]">{title}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-500">{subtitle}</p>
                      <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="space-y-3">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-blue-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-[#1D4ED8]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#0F172A]">AI recommendation</p>
                    <p className="text-[10px] font-bold text-slate-500">Upload address proof before Friday</p>
                  </div>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-black text-[#0F172A]">Recent update</p>
                    <p className="mt-1 text-[10px] font-bold leading-4 text-slate-500">Passport application moved to verification review.</p>
                  </div>
                  <BadgeCheck className="h-4 w-4 text-[#0F766E]" />
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-amber-100 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-[#F59E0B]">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0F172A]">Notification</p>
                      <p className="text-[10px] font-bold text-slate-500">2 service alerts pending</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute -bottom-4 right-6 hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:block">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
        <div className="mt-2 flex gap-1.5">
          {["Track", "Audit", "Schemes"].map((item) => (
            <span key={item} className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-black text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsStrip() {
  const stats = [
    { value: "2.4M+", label: "citizens assisted" },
    { value: "450+", label: "schemes indexed" },
    { value: "28", label: "states covered" },
    { value: "98.7%", label: "guided accuracy" },
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-4">
            <p className="text-3xl font-black tracking-tight text-[#0F172A]">{stat.value}</p>
            <p className="mt-1 text-xs font-extrabold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: FileCheck2, title: "AI Document Audit", desc: "Check uploaded forms, identity proofs, and notices for readiness before you proceed." },
    { icon: SearchCheck, title: "Scheme Eligibility Finder", desc: "Match citizen profiles against central and state welfare programs with clear reasons." },
    { icon: Gauge, title: "Application Tracker", desc: "Follow public-service milestones with status, progress, and next-action guidance." },
    { icon: Languages, title: "Legal Translator", desc: "Turn formal notices into readable language across supported Indian languages." },
    { icon: MessageSquareText, title: "AI Copilot Chat", desc: "Ask procedural questions and get structured steps for documents and services." },
    { icon: LockKeyhole, title: "Secure and Private", desc: "Built around authenticated sessions and privacy-conscious citizen workflows." },
  ];

  return (
    <section id="features" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="AI-powered features" title="A more confident way to navigate public services" subtitle="BureauAI organizes complex government workflows into clear, guided actions for citizens." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={`rounded-3xl border border-slate-200 bg-white p-4 ${premiumShadow}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1D4ED8]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-black tracking-tight text-[#0F172A]">{feature.title}</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services({ user, destination }) {
  const services = [
    { name: "Aadhaar Card", icon: ShieldCheck, desc: "Enrolment, update, linking" },
    { name: "PAN Card", icon: FileText, desc: "Apply, link, e-PAN guidance" },
    { name: "Passport", icon: Globe2, desc: "Fresh, renewal, Tatkal support" },
    { name: "Income Certificate", icon: FileCheck2, desc: "Revenue department workflow" },
    { name: "Ration Card", icon: Building2, desc: "APL, BPL, AAY categories" },
    { name: "Caste Certificate", icon: BadgeCheck, desc: "SC, ST, OBC documentation" },
    { name: "Welfare Schemes", icon: Landmark, desc: "State and central benefits" },
    { name: "Land Records", icon: LayoutDashboard, desc: "Property and RoR guidance" },
  ];

  return (
    <section id="services" className="bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Government services" title="One calm workspace for essential citizen services" subtitle="Start with a service, then let BureauAI organize the documents, eligibility, and timeline." />
        <div id="schemes" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.name} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Link href={user ? destination : "/login"} className="group block rounded-3xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1D4ED8]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#1D4ED8]" />
                  </div>
                  <p className="mt-3 text-sm font-black text-[#0F172A]">{service.name}</p>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500">{service.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: "01", title: "Create your account", desc: "Sign in securely and keep your citizen workspace ready for ongoing services." },
    { step: "02", title: "Ask or upload", desc: "Use the AI copilot or upload documents to understand requirements and readiness." },
    { step: "03", title: "Track and act", desc: "Follow milestones, alerts, recommendations, and next steps from one dashboard." },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="How it works" title="Designed for repeated, practical use" subtitle="Simple enough for first-time users, structured enough for ongoing public-service tracking." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div key={step.step} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D4ED8]">{step.step}</p>
              <h3 className="mt-4 text-lg font-black tracking-tight text-[#0F172A]">{step.title}</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ user, loading, destination, onLogout }) {
  return (
    <section className="bg-[#F8FAFC] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D4ED8]">Start with clarity</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.2] tracking-tight text-[#0F172A] md:text-4xl">
            Make government services easier to understand and act on.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            A clean AI-guided workspace for applications, schemes, documents, translations, and citizen notifications.
          </p>
          <div className="mt-6 flex min-h-[48px] flex-wrap justify-center gap-3">
            {!loading && (
              user ? (
                <>
                  <PrimaryLink href={destination} large>Go to Dashboard</PrimaryLink>
                  <motion.button whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} onClick={onLogout} className="rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-extrabold text-slate-700">
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <PrimaryLink href="/signup" large>Create Free Account</PrimaryLink>
                  <SecondaryLink href="/login" large>Sign In</SecondaryLink>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-16">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1: Brand & Description */}
        <div className="space-y-4">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="BureauAI Logo" className="h-8 w-auto object-contain bg-white p-1 rounded-lg" />
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Empowering Indian citizens with intelligent, AI-guided compliance verification, welfare scheme discovery, and application milestone tracking.
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            An Independent Citizen Platform
          </p>
        </div>

        {/* Column 2: Platform Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Platform Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
            <li><Link href="/services" className="hover:text-white transition-colors">Supported Services</Link></li>
            <li><Link href="/features" className="hover:text-white transition-colors">AI Capabilities</Link></li>
            <li><Link href="/schemes" className="hover:text-white transition-colors">Welfare Schemes</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Citizen Login</Link></li>
          </ul>
        </div>

        {/* Column 3: Government Portals */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Official Gov Portals</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="https://myaadhaar.uidai.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">UIDAI (MyAadhaar) <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://www.incometax.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Income Tax e-Filing <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://scholarships.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">National Scholarship Portal <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://www.digilocker.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">DigiLocker India <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://passportindia.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Passport Seva <ExternalLink className="w-3 h-3" /></a></li>
          </ul>
        </div>

        {/* Column 4: Help & Directory */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Help & Directory</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">National Portal of India <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">myScheme Portal <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://sarathi.parivahan.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Sarathi Parivahan <ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="https://pmjay.gov.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Ayushman Bharat PMJAY <ExternalLink className="w-3 h-3" /></a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-slate-500 text-center md:text-left">
          &copy; 2026 BureauAI. Designed to simplify citizen document verification and public scheme navigation.
        </p>
        <p className="text-slate-600 text-[10px] text-center md:text-right max-w-md">
          Disclaimer: BureauAI is an independent citizen assistance portal. Government logo trademarks, links, and portals referenced are properties of their respective departments.
        </p>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D4ED8]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-[1.2] tracking-tight text-[#0F172A] md:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
}

function PrimaryLink({ href, children, large = false }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Link href={href} className={`inline-flex items-center gap-2 rounded-2xl bg-[#1D4ED8] font-extrabold text-white shadow-[0_14px_30px_rgba(29,78,216,0.22)] transition hover:bg-[#1E40AF] ${large ? "px-5 py-3 text-xs" : "px-3.5 py-2 text-xs"}`}>
        {children}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

function SecondaryLink({ href, children, large = false }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Link href={href} className={`inline-flex items-center rounded-2xl border border-slate-200 bg-white font-extrabold text-slate-700 transition hover:border-[#1D4ED8]/30 hover:text-[#1D4ED8] ${large ? "px-5 py-3 text-xs" : "px-3.5 py-2 text-xs"}`}>
        {children}
      </Link>
    </motion.div>
  );
}
