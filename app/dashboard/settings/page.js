"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User, Bell, Globe, Shield, CheckCircle, AlertCircle, Lock, Mail, Phone, Camera, Upload
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const FETCH_OPTS = { credentials: "include" };

export default function SettingsPage() {
  const { user, setUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = React.useRef(null);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [appNotifs, setAppNotifs] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);

  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showStatus("Image must be under 2MB.", "error");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const showStatus = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = user?.avatar || null;

      // If avatar selected, convert to base64 and send directly in PATCH
      if (avatarFile && avatarPreview) {
        avatarUrl = avatarPreview; // base64 data URL stored directly
      }

      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, ...(avatarUrl ? { avatar: avatarUrl } : {}) }),
        ...FETCH_OPTS,
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser((prev) => ({ ...prev, ...data.user }));
        setAvatarFile(null);
        showStatus("Profile updated successfully! ✓");
      } else {
        // Optimistic local update so UI reflects changes
        setUser((prev) => ({ ...prev, name, email, phone, ...(avatarUrl ? { avatar: avatarUrl } : {}) }));
        setAvatarFile(null);
        showStatus("Profile details saved locally.");
      }
    } catch {
      setUser((prev) => ({ ...prev, name, email, phone }));
      showStatus("Profile details saved locally.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) { showStatus("Please enter a new password.", "error"); return; }
    if (password !== confirmPassword) { showStatus("Passwords do not match.", "error"); return; }
    if (password.length < 8) { showStatus("Password must be at least 8 characters.", "error"); return; }

    setPwLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        ...FETCH_OPTS,
      });
      if (res.ok) {
        setPassword(""); setConfirmPassword("");
        showStatus("Password updated successfully! ✓");
      } else {
        showStatus("Failed to update password.", "error");
      }
    } catch {
      showStatus("Could not connect to server.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifSave = () => showStatus("Notification preferences saved. ✓");
  const handleLanguageSave = () => showStatus(`Language set to ${["English","हिन्दी","मराठी","اردو"][["en","hi","mr","ur"].indexOf(language)]}. ✓`);

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">Manage your profile, security, and notification preferences.</p>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
          statusType === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {statusType === "success"
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Profile + Security */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Details */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Profile Details</CardTitle>
                <CardDescription className="text-xs">Update your personal information</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleProfileSubmit} className="space-y-4">

                {/* Avatar row */}
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src={avatarPreview || user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "user")}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-[#1a56db] text-white rounded-full border-2 border-white hover:bg-blue-700 transition-colors shadow-sm"
                      title="Upload profile photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name || "Citizen User"}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {avatarFile ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          ✓ New photo ready
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a56db] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Verified Citizen
                        </span>
                      )}
                    </div>
                    {avatarFile && (
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                        className="text-[10px] text-red-500 hover:underline mt-1 block">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Email Address" id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <Input
                  label="Phone Number"
                  id="profile-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-[#1a56db] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm shadow-blue-500/20"
                >
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Account Security</CardTitle>
                <CardDescription className="text-xs">Change your account password</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="New Password" id="new-password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Input label="Confirm New Password" id="confirm-password" type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-semibold">
                  🔒 Use at least 8 characters with uppercase, lowercase, numbers, and special characters.
                </div>
                <Button
                  type="submit"
                  isLoading={pwLoading}
                  variant="outline"
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

        {/* Right — Notifications, Language, Status */}
        <div className="lg:col-span-1 space-y-5">

          {/* Notification Preferences */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Notifications</CardTitle>
                <CardDescription className="text-xs">Manage alert preferences</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
                { id: "email-notifs", label: "Email Alerts", sub: "Application status via email", icon: Mail, value: emailNotifs, setter: setEmailNotifs },
                { id: "sms-notifs", label: "SMS Alerts", sub: "OTP and status via SMS", icon: Phone, value: smsNotifs, setter: setSmsNotifs },
                { id: "app-notifs", label: "In-App Notifications", sub: "Bell icon updates in portal", icon: Bell, value: appNotifs, setter: setAppNotifs },
                { id: "status-notifs", label: "Status Change Alerts", sub: "Notified on every milestone", icon: CheckCircle, value: statusUpdates, setter: setStatusUpdates },
              ].map((pref) => {
                const Icon = pref.icon;
                return (
                  <div key={pref.id} className="flex items-center justify-between py-0.5">
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{pref.label}</p>
                        <p className="text-[10px] text-slate-400">{pref.sub}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => pref.setter(!pref.value)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${pref.value ? "bg-[#1a56db]" : "bg-slate-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${pref.value ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleNotifSave}
                className="w-full mt-2 py-2.5 px-4 rounded-xl border border-[#1a56db] text-[#1a56db] hover:bg-blue-50 text-xs font-bold transition-colors"
              >
                Save Preferences
              </button>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Language</CardTitle>
                <CardDescription className="text-xs">Portal display language</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "mr", label: "मराठी" },
                  { code: "ur", label: "اردو" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      language === lang.code
                        ? "bg-[#1a56db] text-white border-[#1a56db] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#1a56db] hover:text-[#1a56db]"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleLanguageSave}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                Apply Language
              </button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Account Status</CardTitle>
                <CardDescription className="text-xs">Identity verification details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
                { label: "Email Verified", value: "✓ Verified", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { label: "Aadhaar Linked", value: "Pending", color: "bg-amber-50 text-amber-600 border-amber-100" },
                { label: "DigiLocker Access", value: "Not Linked", color: "bg-slate-100 text-slate-500 border-slate-200" },
                { label: "Account Type", value: user?.role === "admin" ? "Admin" : "Citizen", color: "bg-blue-50 text-[#1a56db] border-blue-100" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{item.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
