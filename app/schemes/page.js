"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar, Footer } from "../page";
import { 
  Landmark, Info, Clock, CheckCircle2, XCircle, ArrowRight, ExternalLink, 
  Search, ShieldAlert, Award, FileText, CheckCircle, ChevronDown, Sparkles
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FETCH_OPTS = { credentials: "include" };

const SCHEMES_CATALOG = [
  {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    department: "Ministry of Housing and Urban Affairs",
    description: "Affordable housing interest subsidy scheme designed to assist urban and rural poor families in constructing or purchasing their first home.",
    benefits: "Interest subsidies up to 6.5% on home loans up to ₹6 Lakhs, saving up to ₹2.67 Lakhs in total interest payments.",
    officialUrl: "https://pmaymis.gov.in/",
    rules: {
      minAge: 18,
      maxIncome: "₹18,00,000 / year",
      categories: ["General", "OBC", "SC", "ST", "EWS"],
      occupations: ["All Occupations"],
      criteria: "Applicant family must not own a brick house (pucca house) anywhere in India."
    }
  },
  {
    name: "Ayushman Bharat - PMJAY",
    department: "National Health Authority",
    description: "The largest national health assurance scheme in the world, providing cashless secondary and tertiary hospitalisation coverage.",
    benefits: "Cashless health cover of up to ₹5,000,000 per family per year, covering over 1,900 medical procedures and hospital expenses.",
    officialUrl: "https://pmjay.gov.in/",
    rules: {
      minAge: 0,
      maxIncome: "₹2,50,000 / year (Based on SECC household database)",
      categories: ["General", "OBC", "SC", "ST", "EWS"],
      occupations: ["Labourer", "Driver", "Domestic Worker", "Artisan", "Unorganized Sector Workers"],
      criteria: "Identified automatically via Socio-Economic Caste Census (SECC) criteria."
    }
  },
  {
    name: "Post Matric Scholarship Scheme",
    department: "Ministry of Social Justice & Empowerment",
    description: "Scholarship program helping students from marginalized classes complete higher education (Class 11 to Post-Graduation).",
    benefits: "Full tuition fee reimbursement and a monthly maintenance allowance up to ₹1,200 for residential scholars.",
    officialUrl: "https://scholarships.gov.in/",
    rules: {
      minAge: 16,
      maxIncome: "₹2,50,000 / year",
      categories: ["SC", "ST", "OBC", "EWS"],
      occupations: ["Students pursuing higher education"],
      criteria: "Must be enrolled in a recognized institution and maintain academic passing marks."
    }
  },
  {
    name: "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
    department: "Ministry of Labour & Employment",
    description: "Voluntary and contributory pension scheme designed to secure the old-age livelihood of unorganized sector workers.",
    benefits: "Assured minimum monthly pension of ₹3,000 after attaining the age of 60 years.",
    officialUrl: "https://maandhan.in/",
    rules: {
      minAge: 18,
      maxAge: 40,
      maxIncome: "₹1,80,000 / year",
      categories: ["General", "OBC", "SC", "ST"],
      occupations: ["Labourer", "Farmer", "Driver", "Domestic Worker", "Artisan", "Self Employed"],
      criteria: "Must not be covered under EPFO, ESIC, or NPS pension schemes."
    }
  },
  {
    name: "PM Kisan Samman Nidhi",
    department: "Ministry of Agriculture & Farmers Welfare",
    description: "Direct benefit transfer program designed to supplement the financial needs of all landholding farmer families across India.",
    benefits: "Direct income support of ₹6,000 per year, delivered in three equal quarterly installments of ₹2,000 directly to verified bank accounts.",
    officialUrl: "https://pmkisan.gov.in/",
    rules: {
      minAge: 18,
      maxIncome: "₹3,00,000 / year",
      categories: ["General", "OBC", "SC", "ST"],
      occupations: ["Farmer"],
      criteria: "Applicant must own cultivable agricultural land registered under their name."
    }
  },
  {
    name: "Sukanya Samriddhi Yojana",
    department: "Ministry of Finance",
    description: "Small deposit savings program under the 'Beti Bachao Beti Padhao' campaign, designed to fund a girl child's education and marriage.",
    benefits: "Attractive compounding interest rate (currently 8.2% per annum) with full tax exemptions under Section 80C.",
    officialUrl: "https://www.indiapost.gov.in/",
    rules: {
      minAge: 0,
      maxAge: 10,
      maxIncome: "No Income Limit",
      categories: ["General", "OBC", "SC", "ST", "EWS"],
      occupations: ["Girl Child (represented by Parents/Guardians)"],
      criteria: "Account must be opened by parents/guardians before the girl child reaches 10 years of age."
    }
  },
  {
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    department: "Ministry of Finance",
    description: "Collateral-free micro loans scheme designed to fund non-corporate, non-farm small and micro enterprises to encourage entrepreneurship.",
    benefits: "Collateral-free loans up to ₹10 Lakhs categorized as: Shishu (up to ₹50,000), Kishore (up to ₹5 Lakhs), and Tarun (up to ₹10 Lakhs).",
    officialUrl: "https://www.mudra.org.in/",
    rules: {
      minAge: 18,
      maxIncome: "No Income Limit (Business plan assessment required)",
      categories: ["General", "OBC", "SC", "ST", "EWS"],
      occupations: ["Self Employed", "Artisan", "Shopkeeper", "Micro Entrepreneur"],
      criteria: "Must submit a viable business project proposal to the participating bank desk."
    }
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

export default function SchemesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(SCHEMES_CATALOG[0]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API}/api/auth/me`, FETCH_OPTS).catch(() => ({}));
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
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

  const filteredSchemes = SCHEMES_CATALOG.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Social Welfare Schemes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Browse federal welfare programs, evaluate eligibility criteria constraints, learn about financial benefits, and link to official application systems.
          </motion.p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="flex-1 mx-auto max-w-7xl px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Schemes List & Search */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">Search & Filter</span>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450" />
            <input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:shadow-xs transition-all"
            />
          </div>

          <div className="space-y-3.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Available Schemes ({filteredSchemes.length})</span>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {filteredSchemes.map((s) => {
                const isSelected = selectedScheme.name === s.name;
                return (
                  <motion.div 
                    key={s.name} 
                    variants={fadeUp}
                    onClick={() => setSelectedScheme(s)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? "bg-white border-[#1d4ed8] shadow-md ring-1 ring-[#1d4ed8]/20" 
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h3 className="text-xs font-black text-slate-800 truncate leading-snug">{s.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">{s.department}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform shrink-0 ${isSelected ? "text-[#1d4ed8] translate-x-0.5" : "text-slate-300"}`} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Right Side: Detailed Scheme Card */}
        <div className="lg:col-span-2">
          {selectedScheme ? (
            <motion.div
              key={selectedScheme.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6"
            >
              {/* Header */}
              <div className="pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#1d4ed8]" />
                  <span className="text-[9px] font-black text-[#1d4ed8] uppercase tracking-wider">Welfare Benefits Registry</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-2.5 leading-snug">{selectedScheme.name}</h2>
                <p className="text-xs font-semibold text-slate-450 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-350" /> {selectedScheme.department}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">About the Scheme</h4>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                  {selectedScheme.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-600" /> Key Welfare Benefits
                </h4>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed">
                  {selectedScheme.benefits}
                </p>
              </div>

              {/* Rules & Eligibility */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-[#1d4ed8]" /> Eligibility Parameters & Rules
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Target Age Group</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">
                      {selectedScheme.rules.maxAge 
                        ? `${selectedScheme.rules.minAge} to ${selectedScheme.rules.maxAge} years` 
                        : `Above ${selectedScheme.rules.minAge} years`}
                    </span>
                  </div>

                  {/* Income */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Family Income Limit</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">{selectedScheme.rules.maxIncome}</span>
                  </div>

                  {/* Cast Categories */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Eligible Social Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedScheme.rules.categories.map(cat => (
                        <span key={cat} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Occupations */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Eligible Occupations</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedScheme.rules.occupations.map(occ => (
                        <span key={occ} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-200/60 border border-slate-300 text-slate-600 truncate max-w-[150px]" title={occ}>
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional criteria */}
                <div className="p-3.5 bg-blue-50/30 border border-blue-100 rounded-xl">
                  <span className="text-[9px] font-black text-[#1d4ed8] uppercase tracking-wider block mb-1">Additional Criteria Notes</span>
                  <p className="text-xs font-semibold text-slate-650 leading-relaxed">{selectedScheme.rules.criteria}</p>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                <a 
                  href={selectedScheme.officialUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white font-extrabold px-6 py-3 text-xs hover:bg-slate-800 transition-colors"
                >
                  Apply on Government Portal <ExternalLink className="w-4 h-4" />
                </a>
                <Link 
                  href={user ? destination : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Verify Eligibility via Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </motion.div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
              <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h4 className="text-sm font-black text-slate-800">No schemes matching search terms</h4>
              <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">Try searching for other words like housing, farmer, scholarship, or loans.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
