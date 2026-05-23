"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar, Footer } from "../page";
import { 
  FileCheck2, SearchCheck, Gauge, Languages, MessageSquareText, LockKeyhole,
  Sparkles, ExternalLink, ArrowRight, ShieldCheck, Zap, Info
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FETCH_OPTS = { credentials: "include" };

const FEATURES_DETAIL = [
  {
    title: "AI Document Compliance Audit",
    icon: FileCheck2,
    tagline: "OCR-assisted documentation pre-vetting",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    desc: "Upload scanned copies of credentials like Aadhaar, PAN, and Passports. Our compliance check engine analyzes document integrity, confirms matches, extracts essential data, and checks for common errors like expired dates or blurry details before you submit them to government desks.",
    technicalDetails: [
      "Automated OCR-driven metadata extraction (names, IDs, DOB).",
      "Format compliance checks (JPEG/PNG/PDF, size limits under 2MB).",
      "Visual checksum scans to verify issuing authority seals.",
      "Optimized to run on desktop scans or mobile snaps."
    ]
  },
  {
    title: "Social Welfare Scheme Finder",
    icon: SearchCheck,
    tagline: "Personalized benefit matching algorithm",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    desc: "Evaluating eligibility for Indian social welfare programs (such as PMAY, PMJAY, or scholarship programs) is complicated. Our checker evaluates your demographic profile (age, location, occupation, caste, annual income) against federal and state databases to deliver matching schemes.",
    technicalDetails: [
      "Custom eligibility criteria filters matching age, caste, and income parameters.",
      "Confidence matchmaking scores indicating eligibility levels.",
      "Clear eligibility breakdowns outlining matching and missing parameters.",
      "Direct link mappings to official online registration forms (.gov.in)."
    ]
  },
  {
    title: "Application Milestone Tracker",
    icon: Gauge,
    tagline: "End-to-end milestone monitoring",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    desc: "Follow the status of municipal and state application filings from registration to final approval. The dashboard divides complex bureaucratic processing pathways into a clear 9-stage milestone track, providing alerts when officer actions are required.",
    technicalDetails: [
      "9 progressive workflow stages mapping document upload to final delivery.",
      "Centralized event timelines updating with date and description logs.",
      "Integrated Reference Code links connecting directly to government databases.",
      "Automated alerts indicating required compliance updates."
    ]
  },
  {
    title: "Legal Notice Simplifier & Translator",
    icon: Languages,
    tagline: "Natural Language Processing for bureaucratic text",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    desc: "Government notifications and legal notices are often written in dense, formal jargon. The translation engine simplifies legal terminology into plain language and translates it into regional languages (Hindi, Marathi, Bengali, Urdu) for clear understanding.",
    technicalDetails: [
      "Translates legal jargon into plain, simplified explanation structures.",
      "Multi-language support for regional scripts (Devanagari, Bengali, Urdu).",
      "Side-by-side comparative views showing Simplified English and translations.",
      "Option to export translations for references."
    ]
  },
  {
    title: "Gemini AI Assistant Copilot",
    icon: MessageSquareText,
    tagline: "Interactive 24/7 procedural helpline",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    desc: "Connect directly with our AI copilot to clarify procedure guidelines, required document checklists, and application steps. The copilot responds dynamically in your preferred language and is strictly scoped to Indian government portal operations.",
    technicalDetails: [
      "Interactive multi-session conversations powered by LLM technologies.",
      "Responds in regional languages (phonetic typos, scripts).",
      "Strict scope boundary filtering out unrelated queries.",
      "Built-in Text-to-Speech support to hear explanations aloud."
    ]
  },
  {
    title: "Secure Identity Linkage & Vault",
    icon: LockKeyhole,
    tagline: "Private-by-design citizen data isolation",
    color: "bg-slate-50 text-slate-600 border-slate-100",
    desc: "Upload and verify documents securely. Our identity vault supports Aadhaar OTP validation (using the secure Verhoeff checksum algorithm) and links with digital lockers (DigiLocker) to keep your scanned document copies private, secure, and ready.",
    technicalDetails: [
      "Verhoeff mathematical checksum validates Aadhaar numbers locally.",
      "Secure simulated OTP generation and authentication checking.",
      "Private data isolation protecting sensitive citizen credentials.",
      "DigiLocker linkages support online document retrievals."
    ]
  }
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function FeaturesPage() {
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

  const destination = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0F172A] flex flex-col">
      <Navbar user={user} loading={loading} destination={destination} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-28 pb-20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute left-[-10rem] top-12 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl sm:text-5xl font-black tracking-tight"
          >
            Intelligent AI Capabilities
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Explore the advanced algorithms, natural language processing models, and secure verification systems powering the BureauAI citizen workspace.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <motion.div 
          variants={stagger} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES_DETAIL.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div 
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Icon Block */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-4">{f.tagline}</span>
                  <h3 className="text-base font-black text-slate-900 mt-1.5 leading-snug">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mt-3">{f.desc}</p>
                </div>

                {/* Technical checklist */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-2">Technical Engine Specs</span>
                  {f.technicalDetails.map((detail, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-[11px] font-semibold text-slate-500 leading-normal">
                      <Zap className="w-3 h-3 text-[#1d4ed8] mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 rounded-3xl bg-[#EEF4FF] border border-blue-100 text-center max-w-3xl mx-auto shadow-sm"
        >
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#1d4ed8] animate-pulse" /> Ready to test these features?
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Create a secure account, upload verification files, and experience automated document audits and scheme matching instantly.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-blue-500/10 transition-all active:scale-95"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href={user ? destination : "/login"}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white font-extrabold px-5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
