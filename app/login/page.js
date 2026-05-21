"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSSOSimulator from "@/components/GoogleSSOSimulator";
import { 
  Shield, AlertTriangle, Lock, ArrowRight, CheckCircle, 
  Mail, ArrowLeft, RefreshCw, Send 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP Verification States (in case account is unverified)
  const [step, setStep] = useState("login"); // "login" or "verify"
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const otpRefs = [
    useRef(null), useRef(null), useRef(null), 
    useRef(null), useRef(null), useRef(null)
  ];

  // Timer Effect for OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Load Google Identity Services script on mount for synchronous prompt execution
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && !window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          setStep("verify");
          setResendTimer(60);
          setOtpValues(["", "", "", "", "", ""]);
        } else {
          setError(data.error || "Authentication failed.");
        }
      } else {
        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Unable to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const newOtp = [...otpValues];
      newOtp[index] = "";
      setOtpValues(newOtp);
      return;
    }

    const newOtp = [...otpValues];
    newOtp[index] = cleanValue[cleanValue.length - 1];
    setOtpValues(newOtp);

    // Auto-focus next input
    if (index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        otpRefs[index - 1].current?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtpValues(newOtp);
      otpRefs[5].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Unable to connect to verification server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendTimer(60);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend verification code.");
      }
    } catch {
      setError("Failed to connect for resending verification code.");
    }
  };

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      if (window.google) {
        initializeGoogleSSO(clientId);
      } else {
        // Fallback if script hasn't preloaded
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => initializeGoogleSSO(clientId);
        document.body.appendChild(script);
      }
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const initializeGoogleSSO = (clientId) => {
    window.google?.accounts.id.initialize({
      client_id: clientId,
      use_fedcm: false,
      callback: async (response) => {
        setIsGoogleLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Google authentication failed.");
          } else {
            if (data.user?.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
            router.refresh();
          }
        } catch {
          setError("Google SSO link failed.");
        } finally {
          setIsGoogleLoading(false);
        }
      }
    });

    // Request One Tap prompt and fallback to simulator if blocked/aborted
    window.google?.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn("Google One Tap prompt display failed or skipped:", notification.getNotDisplayedReason() || notification.getSkippedReason());
        setIsGoogleModalOpen(true);
      }
    });
  };

  const handleGoogleSimulate = async (profile) => {
    setError("");
    setIsGoogleLoading(true);
    setIsGoogleModalOpen(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google authentication simulation failed.");
      } else {
        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Google SSO link simulation failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f4f8" }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col w-[420px] bg-[#1a56db] p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -left-8 bottom-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute right-8 bottom-10 w-32 h-32 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Bureau<span className="text-blue-200">AI</span></span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            India&apos;s AI-Powered<br />Governance Portal
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Navigate government services, track applications, audit documents, and find welfare schemes — all in one place.
          </p>

          <div className="space-y-3">
            {["AI Document Audit & Compliance", "Scheme Eligibility Finder", "Application Milestone Tracker", "Multilingual Legal Translator"].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-blue-100 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-blue-200 text-xs">Ministry of Digital Governance · Government of India</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Bureau<span className="text-[#1a56db]">AI</span></span>
          </div>

          {step === "login" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Sign in to your account to continue.{" "}
                  <Link href="/signup" className="text-[#1a56db] font-semibold hover:underline">Register here</Link>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Input label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@bureauai.in" autoComplete="email" required />
                  <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#1a56db]" />
                      Remember me
                    </label>
                    <a href="#" onClick={e => { e.preventDefault(); setError("Recovery link sent. (Demo)"); }} className="text-[#1a56db] font-semibold hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button type="submit" className="w-full justify-center gap-2" isLoading={isLoading}>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="mt-5 relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-slate-400 font-medium">or</span></div>
                </div>

                <div className="mt-5">
                  <Button variant="outline" className="w-full justify-center gap-3" onClick={handleGoogleClick} isLoading={isGoogleLoading}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button 
                  onClick={() => setStep("login")} 
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium mb-3 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Login
                </button>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                  <Mail className="w-6 h-6 text-[#1a56db]" /> Verify your email
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  Your email is unverified. We&apos;ve sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-semibold animate-shake">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-1">
                      Verification Code
                    </label>
                    <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
                      {otpValues.map((val, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={val}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-[#1a56db] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-sm"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full justify-center gap-2.5" isLoading={isLoading}>
                    Verify & Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Didn&apos;t receive the code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 select-none">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" /> Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      className="text-[#1a56db] font-bold hover:underline hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Resend Code <Send className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL encryption · Government-grade security</span>
          </div>
        </div>
      </div>

      <GoogleSSOSimulator
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSimulate={handleGoogleSimulate}
        isLoading={isGoogleLoading}
      />
    </div>
  );
}
