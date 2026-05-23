"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAdmin } from "./layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User, Lock, Bell, Camera, Sparkles, RefreshCw, Mail, Phone,
  CheckCircle, AlertCircle, ShieldCheck, ShieldAlert
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const FETCH_OPTS = { credentials: "include" };

export default function AdminProfileSettings() {
  const { admin, setAdmin } = useAdmin() || {};

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSeed, setAvatarSeed] = useState("");
  const avatarInputRef = useRef(null);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [appNotifs, setAppNotifs] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  
  const [toast, setToast] = useState(null); // { msg, type: "success" | "error" }

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
      setPhone(admin.phone || "");
      setEmailNotifs(admin.emailNotifs !== undefined ? admin.emailNotifs : true);
      setSmsNotifs(admin.smsNotifs !== undefined ? admin.smsNotifs : true);
      setAppNotifs(admin.appNotifs !== undefined ? admin.appNotifs : true);
      setStatusUpdates(admin.statusUpdates !== undefined ? admin.statusUpdates : true);
      
      if (admin.avatar) {
        setAvatarPreview(admin.avatar);
        // If avatar is a Dicebear URL, extract the seed if possible
        if (admin.avatar.includes("dicebear.com")) {
          try {
            const url = new URL(admin.avatar);
            const seedParam = url.searchParams.get("seed");
            if (seedParam) setAvatarSeed(seedParam);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }, [admin]);

  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Image must be under 2MB.", "error");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarSeed(""); // Clear seed since custom file is uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleSeedChange = (val) => {
    setAvatarSeed(val);
    setAvatarFile(null); // Clear custom upload
    const generatedUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(val || "admin")}`;
    setAvatarPreview(generatedUrl);
  };

  const handleRandomizeSeed = () => {
    const rand = "admin_" + Math.random().toString(36).substring(2, 9);
    handleSeedChange(rand);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalAvatarUrl = admin?.avatar || "";
      if (avatarFile && avatarPreview) {
        finalAvatarUrl = avatarPreview; // Base64 data URL
      } else if (avatarSeed) {
        finalAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarSeed)}`;
      }

      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, avatar: finalAvatarUrl }),
        ...FETCH_OPTS,
      });

      const data = await res.json();
      if (res.ok && data.user) {
        if (setAdmin) setAdmin(data.user);
        setAvatarFile(null);
        triggerToast("Profile details updated successfully! ✓");
      } else {
        // Optimistic local update
        if (setAdmin) {
          setAdmin((prev) => ({ ...prev, name, email, phone, avatar: finalAvatarUrl }));
        }
        setAvatarFile(null);
        triggerToast(data.error || "Profile details saved locally.");
      }
    } catch (err) {
      if (setAdmin) {
        setAdmin((prev) => ({ ...prev, name, email, phone }));
      }
      triggerToast("Could not sync with server; details saved locally.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      triggerToast("Please enter a new password.", "error");
      return;
    }
    if (password !== confirmPassword) {
      triggerToast("Passwords do not match.", "error");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      triggerToast("Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.", "error");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        ...FETCH_OPTS,
      });
      const data = await res.json();
      if (res.ok) {
        setPassword("");
        setConfirmPassword("");
        triggerToast("Administrative password updated successfully! ✓");
      } else {
        triggerToast(data.error || "Failed to update password.", "error");
      }
    } catch (err) {
      triggerToast("Could not connect to authentication server.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifSave = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifs, smsNotifs, appNotifs, statusUpdates }),
        ...FETCH_OPTS,
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (setAdmin) setAdmin(data.user);
        triggerToast("Notification channels saved successfully. ✓");
      } else {
        triggerToast("Failed to save alert preferences.", "error");
      }
    } catch (err) {
      triggerToast("Could not connect to system settings.", "error");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans relative">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-500/5" 
            : "bg-red-50 border-red-200 text-red-650 shadow-red-500/5"
        }`}>
          <div className={`w-2 h-2 rounded-full bg-current ${toast.type === "success" ? "animate-pulse" : "animate-ping"}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-[#1a56db]" />
            Profile & Administrative Settings
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Manage credentials, generate bottts avatars, and customize system notification gates
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 font-mono text-[9px] font-black text-slate-500 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          SECURE SEED: {admin?.id?.substring(0, 8) || "ADMIN"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Account details card */}
          <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-slate-900">Account Credentials</CardTitle>
                <CardDescription className="text-xs">Update your administrative information and identity metadata</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                
                {/* Premium Avatar Editor Section */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* Left part: Avatar preview and actions */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <img 
                        src={avatarPreview || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(admin?.name || "admin")}`}
                        alt="Admin Avatar"
                        className="w-24 h-24 rounded-2xl border-2 border-white bg-slate-100 object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-[-6px] right-[-6px] p-2 bg-[#1a56db] text-white rounded-xl border-2 border-white hover:bg-blue-700 transition-all shadow-md active:scale-90"
                        title="Upload profile photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    {avatarFile && (
                      <button 
                        type="button" 
                        onClick={() => { setAvatarFile(null); setAvatarPreview(admin?.avatar || ""); }}
                        className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-wide mt-3"
                      >
                        Remove Uploaded Photo
                      </button>
                    )}
                  </div>

                  {/* Right part: Dicebear Seed generator controls */}
                  <div className="flex-1 space-y-3.5 w-full">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1a56db]" />
                        Dicebear Bottts Generator
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
                        Generate bottts-style vector avatars automatically using custom seeds
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={avatarSeed}
                        onChange={(e) => handleSeedChange(e.target.value)}
                        placeholder="Type a custom seed (e.g. bureauai)..."
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a56db] bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleRandomizeSeed}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all text-slate-700 flex items-center justify-center shadow-xs active:scale-95 shrink-0"
                        title="Randomize Avatar Seed"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {avatarSeed && (
                      <p className="text-[9px] font-bold text-[#1a56db] leading-none">
                        ✓ Vector generated from: <span className="font-mono">{avatarSeed}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Admin Full Name" 
                    id="admin-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="Official Email Address" 
                    id="admin-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <Input 
                  label="Secured Phone Number" 
                  id="admin-phone" 
                  type="tel" 
                  placeholder="+91 99999 88888" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/15"
                  >
                    Save Profile Settings
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>
          
        </div>

        {/* Right Column: Security and Notification Preferences */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Change Password Card */}
          <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-slate-900">Update Password</CardTitle>
                <CardDescription className="text-xs">Ensure security clearance validation parameters are met</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input 
                  label="New Security Password" 
                  id="new-password" 
                  type="password" 
                  placeholder="Enter new password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <Input 
                  label="Confirm Password" 
                  id="confirm-password" 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required
                />
                
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-250/50 text-[10px] text-amber-750 font-semibold leading-relaxed">
                  🛡️ Use 8+ characters, combining capital/lowercase letters, numerals, and special signs.
                </div>

                <Button
                  type="submit"
                  isLoading={pwLoading}
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alert Toggles Card */}
          <Card className="bg-white border border-slate-200/80 shadow-xs" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-slate-900">Alert Prefs</CardTitle>
                <CardDescription className="text-xs">Determine your administrative system updates notifications</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                { id: "email-notifs", label: "Email Dispatches", desc: "Receive analytics reports by mail", value: emailNotifs, setter: setEmailNotifs },
                { id: "sms-notifs", label: "SMS Operations", desc: "Urgent telemetry failures via cell", value: smsNotifs, setter: setSmsNotifs },
                { id: "app-notifs", label: "Dashboard Alerts", desc: "In-app system notifications banner", value: appNotifs, setter: setAppNotifs },
                { id: "status-notifs", label: "Milestone Ledger updates", desc: "Log activity feed for system milestones", value: statusUpdates, setter: setStatusUpdates },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between py-1">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 leading-none">{pref.label}</p>
                    <p className="text-[10px] text-slate-450 mt-1 leading-tight">{pref.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => pref.setter(!pref.value)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer outline-none ${
                      pref.value ? "bg-[#1a56db]" : "bg-slate-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      pref.value ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={handleNotifSave}
                  isLoading={notifLoading}
                  variant="glass"
                  className="w-full text-[#1a56db] border-[#1a56db]/30 hover:bg-blue-50 font-extrabold py-2.5 rounded-xl text-xs"
                >
                  Save Notification Toggles
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
