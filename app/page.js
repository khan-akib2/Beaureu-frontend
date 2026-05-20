import Link from "next/link";

export const metadata = {
  title: "BureauAI — India's AI-Powered Governance Portal",
  description: "Navigate Indian government services with AI. Apply for Aadhaar, PAN, Passport, Income Certificates, find welfare schemes and track applications — all in one place.",
};

export default function LandingPage() {
  const features = [
    {
      icon: "🤖",
      title: "AI Document Audit",
      desc: "Upload any government document and get instant AI-powered analysis, compliance check, and suggestions.",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
    },
    {
      icon: "🎯",
      title: "Scheme Eligibility Finder",
      desc: "Enter your profile once — get matched to eligible welfare schemes from PMAY, PM Kisan, Ayushman Bharat, and more.",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
    },
    {
      icon: "📍",
      title: "Application Tracker",
      desc: "Real-time milestone tracking for Aadhaar, Passport, Income Certificates, and all government applications.",
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
    },
    {
      icon: "🌐",
      title: "Legal Translator",
      desc: "Simplify complex bureaucratic notices into plain English, Hindi, Marathi or Urdu in seconds.",
      color: "from-purple-500 to-violet-600",
      bg: "bg-purple-50",
    },
    {
      icon: "💬",
      title: "AI Copilot Chat",
      desc: "Ask any question about government procedures — Aadhaar updates, PAN linking, ration cards — and get step-by-step guidance.",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      desc: "Bank-grade 256-bit SSL encryption. Your data never leaves our secure government-compliant servers.",
      color: "from-slate-600 to-slate-800",
      bg: "bg-slate-50",
    },
  ];

  const stats = [
    { value: "2.4M+", label: "Citizens Served" },
    { value: "98.7%", label: "AI Accuracy Rate" },
    { value: "450+", label: "Govt Schemes Listed" },
    { value: "28", label: "States Covered" },
  ];

  const services = [
    { name: "Aadhaar Card", icon: "🪪", desc: "Enrolment, Update, Linking" },
    { name: "PAN Card", icon: "💳", desc: "Apply, Link to Aadhaar, e-PAN" },
    { name: "Passport", icon: "📘", desc: "Fresh, Renewal, Tatkal" },
    { name: "Income Certificate", icon: "📋", desc: "Tahsildar, Revenue Dept." },
    { name: "Ration Card", icon: "🏪", desc: "BPL, APL, AAY categories" },
    { name: "Caste Certificate", icon: "📄", desc: "SC, ST, OBC documentation" },
    { name: "Birth Certificate", icon: "👶", desc: "Municipal Corporation" },
    { name: "Land Records", icon: "🏡", desc: "7/12, RoR, Property Cards" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center shadow-sm shadow-blue-500/30">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base">
              Bureau<span className="text-[#1a56db]">AI</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Services", "About"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-[#1a56db] transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-[#1a56db] transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold text-white bg-[#1a56db] hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-px">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/40 to-transparent rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#1a56db 1px, transparent 1px), linear-gradient(to right, #1a56db 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-[#1a56db]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse" />
              Powered by Google Gemini AI · Official Portal
            </div>

            <div>
              <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Navigate India's
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a56db] to-indigo-500">
                  Government
                </span>
                <br />
                with AI Ease
              </h1>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
                BureauAI simplifies every government process — from Aadhaar updates to passport renewals. AI-powered, multilingual, and built for every Indian citizen.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 text-sm">
                Start for Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 hover:border-[#1a56db] text-slate-700 hover:text-[#1a56db] font-bold rounded-2xl transition-all text-sm hover:shadow-sm">
                Sign In to Portal
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {["🔒 256-bit SSL", "🇮🇳 India-First", "⚡ Instant AI Replies"].map((item) => (
                <span key={item} className="text-xs font-semibold text-slate-500">{item}</span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Preview Card */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Card header */}
              <div className="bg-[#1a56db] p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-sm">BureauAI Dashboard</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                </div>
              </div>

              {/* Stat cards */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Applications", value: "12", icon: "📁", color: "text-blue-600 bg-blue-50" },
                    { label: "Approved", value: "8", icon: "✅", color: "text-emerald-600 bg-emerald-50" },
                    { label: "In Progress", value: "3", icon: "⏳", color: "text-amber-600 bg-amber-50" },
                    { label: "Action Req.", value: "1", icon: "⚠️", color: "text-red-600 bg-red-50" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className={`text-lg mb-1`}>{s.icon}</div>
                      <p className="text-xl font-black text-slate-900">{s.value}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* AI chat preview */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-2">🤖 AI COPILOT</p>
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-[#1a56db] text-white text-[10px] font-medium px-3 py-1.5 rounded-xl max-w-[80%]">
                        How do I update my Aadhaar address?
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-3 py-2 rounded-xl shadow-sm leading-relaxed">
                      Visit myaadhaar.uidai.gov.in → click "Update Address" → upload address proof + OTP verification. Takes 2–3 days! ✓
                    </div>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-700">Passport Renewal — Under Review</p>
                    <span className="text-[10px] font-bold text-[#1a56db]">65%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full">
                    <div className="h-full w-[65%] bg-[#1a56db] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✓ Live & Secure
            </div>
            <div className="absolute -bottom-3 -left-4 bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 text-xs">
              <span className="font-bold text-slate-900">AI responded</span>
              <span className="text-slate-400 ml-1">in 1.2s</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-[#1a56db] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-white mb-1">{s.value}</p>
              <p className="text-blue-200 text-sm font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[#1a56db] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-4">
              ✦ AI-Powered Features
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Everything you need to navigate
              <br />
              <span className="text-[#1a56db]">Indian bureaucracy</span>
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              From document analysis to scheme eligibility — BureauAI handles it all with the power of Google Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#1a56db]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[#1a56db] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-4">
              ✦ Government Services
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Every service. One portal.
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              Get guidance for 450+ government services across all states and central departments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <Link href="/login" key={s.name}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#1a56db]/40 hover:shadow-md transition-all text-center hover:-translate-y-0.5">
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
                <span className="inline-block mt-3 text-[10px] font-bold text-[#1a56db] group-hover:underline">
                  Get started →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[#1a56db] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-4">
              ✦ How It Works
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up free with your email. No Aadhaar or OTP required to start.", icon: "👤" },
              { step: "02", title: "Ask or Upload", desc: "Chat with BureauAI or upload a document for instant AI-powered analysis.", icon: "💬" },
              { step: "03", title: "Track & Apply", desc: "Get step-by-step guidance, track applications, and find eligible schemes.", icon: "🎯" },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-16 h-16 bg-blue-50 border-2 border-[#1a56db]/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
                  {s.icon}
                </div>
                <span className="absolute top-0 right-8 text-xs font-black text-slate-200">{s.step}</span>
                <h3 className="font-black text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-br from-[#1a56db] to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
            Start navigating smarter today
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join 2.4 million+ citizens who use BureauAI to cut through red tape.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1a56db] font-black rounded-2xl hover:bg-blue-50 transition-all shadow-lg text-sm hover:-translate-y-0.5">
              Create Free Account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-sm">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-blue-300 text-xs">
            No credit card required · Free forever for citizens · Secured by SSL
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="font-bold text-white">Bureau<span className="text-blue-400">AI</span></span>
            </div>

            <p className="text-slate-500 text-sm">
              © 2026 BureauAI · Ministry of Digital Governance · Government of India
            </p>

            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                <a key={item} href="#" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
