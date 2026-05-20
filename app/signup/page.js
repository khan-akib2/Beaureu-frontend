"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Shield, AlertTriangle, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, { credentials: "include",  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); }
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("Unable to connect to authentication server."); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setError(""); setIsGoogleLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, { credentials: "include",  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "demo@bureauai.in", name: "Aarav Sharma", picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav" }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Google authentication failed."); }
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("Google SSO link failed."); }
    finally { setIsGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f4f8" }}>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col w-[420px] bg-[#1e3a5f] p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -left-8 bottom-20 w-64 h-64 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Bureau<span className="text-blue-300">AI</span></span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Start Your Digital<br />Governance Journey
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Create your free citizen account and get instant access to AI-powered government services across India.
          </p>

          <div className="space-y-3">
            {["Free citizen account — no cost", "Secure document storage & audit", "Real-time application tracking", "Available in 12+ Indian languages"].map(f => (
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

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Bureau<span className="text-[#1a56db]">AI</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Already registered?{" "}
              <Link href="/login" className="text-[#1a56db] font-semibold hover:underline">Sign in here</Link>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Aarav Sharma" required />
              <Input label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@bureauai.in" autoComplete="email" required />
              <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />

              <Button type="submit" className="w-full justify-center gap-2" isLoading={isLoading}>
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-5 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-slate-400 font-medium">or</span></div>
            </div>

            <div className="mt-5">
              <Button variant="outline" className="w-full justify-center gap-3" onClick={handleGoogleSignup} isLoading={isGoogleLoading}>
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

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL · By signing up, you agree to our Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
