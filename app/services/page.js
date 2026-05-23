"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar, Footer } from "../page";
import { 
  ShieldCheck, FileText, Globe2, Building2, BadgeCheck, Landmark, 
  LayoutDashboard, CreditCard, ChevronRight, ExternalLink, Info, Clock, AlertCircle, ArrowRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FETCH_OPTS = { credentials: "include" };

const SERVICES_DETAIL = [
  {
    name: "Aadhaar Card Update & Verification",
    department: "Unique Identification Authority of India (UIDAI)",
    category: "Identity",
    icon: ShieldCheck,
    desc: "Update mobile number, address, biometric, or name details on your National Identity card under UIDAI compliance rules.",
    timeline: "5 - 10 working days",
    officialUrl: "https://myaadhaar.uidai.gov.in/",
    documents: [
      "Proof of Identity (POI) (Passport, PAN Card, Voter ID)",
      "Proof of Address (POA) (Utility Bills, Bank Statement, Rent Agreement)",
      "Registered Mobile Number (for secure OTP authentication)"
    ],
    procedure: "1. Log in to the myAadhaar portal. 2. Select demographic fields to update. 3. Upload scanned document proofs. 4. Complete online fee payment. 5. Download the URN tracking slip."
  },
  {
    name: "Permanent Account Number (PAN Card)",
    department: "Income Tax Department / NSDL / UTIITSL",
    category: "Finance",
    icon: CreditCard,
    desc: "Register a Permanent Account Number for financial tax audit compliance. Link PAN with Aadhaar as mandated by regulatory laws.",
    timeline: "10 - 15 working days",
    officialUrl: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    documents: [
      "Proof of Identity (Aadhaar Card, Passport, Voter ID)",
      "Proof of Address (Aadhaar Card, Utility Bills, Bank Statement)",
      "Proof of Date of Birth (Birth Certificate, Matriculation Certificate)"
    ],
    procedure: "1. Visit the NSDL/UTIITSL application portal. 2. Fill out Form 49A. 3. Perform e-KYC using Aadhaar OTP or submit documents physically. 4. Pay regulatory processing fee. 5. Receive 15-digit acknowledgement number."
  },
  {
    name: "Indian Passport Renewal & Re-issue",
    department: "Ministry of External Affairs (MEA)",
    category: "Travel",
    icon: Globe2,
    desc: "Renew expired passports, apply for fresh booklets, or update demographic addresses under strict MEA guidelines.",
    timeline: "15 - 30 working days (Normal) / 3 - 7 days (Tatkal)",
    officialUrl: "https://passportindia.gov.in/",
    documents: [
      "Old Passport Booklet (in case of renewal)",
      "Proof of Address (Utility Bills, Aadhaar Card, Parent's Passport)",
      "Non-ECR Proof (Matriculation Certificate, Degree Certificate)"
    ],
    procedure: "1. Register on the Passport Seva Online Portal. 2. Complete the online application form. 3. Pay schedule fee and book slot at PSK/POPSK. 4. Attend biometrics verification at the center. 5. Complete police verification."
  },
  {
    name: "Income Certificate Verification",
    department: "State Revenue Department / Tehsildar Office",
    category: "Certificate",
    icon: FileText,
    desc: "Official income validation document required for state-sponsored academic scholarships, welfare schemes, and concessions.",
    timeline: "7 - 15 working days",
    officialUrl: "https://india.gov.in/service/apply-income-certificate",
    documents: [
      "Salary Slips (for salaried employees)",
      "Income Tax Return (ITR) / Form 16",
      "Land Ownership Records (for agricultural income)",
      "Affidavit declaring yearly family income"
    ],
    procedure: "1. Visit your state's e-District portal. 2. Complete the income certificate registration form. 3. Upload salary slips, identity cards, and address proofs. 4. Submit to local Revenue Inspector / Tehsildar for verification."
  },
  {
    name: "Driving License Renewal & Issue",
    department: "Regional Transport Office (RTO)",
    category: "Transport",
    icon: LayoutDashboard,
    desc: "Renew licensing validity, apply for learners licenses, or update demographic addresses on motor vehicle credentials.",
    timeline: "15 - 30 working days",
    officialUrl: "https://sarathi.parivahan.gov.in/",
    documents: [
      "Existing Driving License booklet/card",
      "Medical Certificate Form 1A (compulsory for applicants above 40)",
      "Aadhaar Card (for digital identity verification)"
    ],
    procedure: "1. Access the Sarathi Parivahan portal. 2. Enter DL details and request renewal service. 3. Upload scan documents and Form 1A. 4. Pay DL renewal fees. 5. RTO issues the updated smart card DL."
  },
  {
    name: "Caste Certificate (SC / ST / OBC)",
    department: "State Revenue Department / District Magistrate",
    category: "Certificate",
    icon: BadgeCheck,
    desc: "Verification certificate verifying social category for educational quotas, government job recruitments, and public concessions.",
    timeline: "15 - 30 working days",
    officialUrl: "https://india.gov.in/",
    documents: [
      "Paternal Caste proof (father/sibling's Caste Certificate)",
      "Proof of Identity & Address (Aadhaar Card, Voter ID)",
      "Signed declaration/affidavit confirming category status"
    ],
    procedure: "1. Access your state's online e-District platform. 2. Select Caste Certificate application. 3. Upload blood relative's caste certificate and identity proofs. 4. Complete local verification checks by the Patwari/Revenue Inspector."
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

export default function ServicesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(SERVICES_DETAIL[0]);

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
        <div className="absolute right-[-10rem] top-12 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl sm:text-5xl font-black tracking-tight"
          >
            Supported Citizen Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Access comprehensive information, verify documents requirements, check processing timelines, and navigate directly to official government portals for all essential citizen applications.
          </motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 mx-auto max-w-7xl px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Services List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Select A Service</span>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {SERVICES_DETAIL.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = selectedService.name === s.name;
              return (
                <motion.div 
                  key={s.name} 
                  variants={fadeUp}
                  onClick={() => setSelectedService(s)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    isSelected 
                      ? "bg-white border-[#1d4ed8] shadow-md ring-1 ring-[#1d4ed8]/20" 
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected ? "bg-blue-50 text-[#1d4ed8] border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-slate-800 truncate leading-snug">{s.name}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">{s.department}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${isSelected ? "text-[#1d4ed8] translate-x-0.5" : "text-slate-350"}`} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Side: Detailed Service View */}
        <div className="lg:col-span-2">
          {selectedService && (
            <motion.div
              key={selectedService.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6"
            >
              {/* Header */}
              <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-blue-650 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedService.category}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-2.5 leading-snug">{selectedService.name}</h2>
                  <p className="text-xs font-semibold text-slate-450 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-350" /> {selectedService.department}
                  </p>
                </div>
                <div className="shrink-0 bg-slate-50 px-4 py-3 border border-slate-150 rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Timeline</span>
                  <div className="flex items-center gap-1 text-[#0F766E] font-black text-xs mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedService.timeline}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm leading-relaxed text-slate-650 font-medium">
                {selectedService.desc}
              </p>

              {/* Required Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4.5 h-4.5 text-[#1d4ed8]" /> Required Documents Checklist
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedService.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 leading-relaxed">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="w-4.5 h-4.5 text-[#1d4ed8]" /> Step-by-Step Filing Pathway
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-650 font-medium whitespace-pre-line">
                    {selectedService.procedure}
                  </p>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                <a 
                  href={selectedService.officialUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white font-extrabold px-6 py-3 text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Visit Official Registry Portal <ExternalLink className="w-4 h-4" />
                </a>
                <Link 
                  href={user ? destination : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Link to BureauAI Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
