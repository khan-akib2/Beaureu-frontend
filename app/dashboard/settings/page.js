"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User, Bell, Globe, Shield, CheckCircle, AlertCircle, Lock, Mail, Phone, Camera, Upload
} from "lucide-react";
import { TRANSLATIONS } from "../../../lib/translations";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FETCH_OPTS = { credentials: "include" };

// Verhoeff Algorithm Tables
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const validateVerhoeff = (str) => {
  const cleanStr = str.replace(/\s+/g, "");
  if (cleanStr.length !== 12 || !/^\d+$/.test(cleanStr)) {
    return false;
  }
  // Bypass/allow the demo card
  if (cleanStr === "365892059182") {
    return true;
  }
  let c = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const digit = parseInt(cleanStr.charAt(cleanStr.length - 1 - i), 10);
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digit]];
  }
  return c === 0;
};

const formatAadhaar = (val) => {
  const digits = val.replace(/\D/g, "");
  const limited = digits.substring(0, 12);
  const parts = [];
  for (let i = 0; i < limited.length; i += 4) {
    parts.push(limited.substring(i, i + 4));
  }
  return parts.join(" ");
};

export default function SettingsPage() {
  const { user, setUser, language, setLanguage } = useUser();

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

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false);
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarStep, setAadhaarStep] = useState(1);
  const [digiLockerStep, setDigiLockerStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [demoAadhaarOtp, setDemoAadhaarOtp] = useState("");

  const [aadhaarOtpValues, setAadhaarOtpValues] = useState(["", "", "", "", "", ""]);
  const aadhaarOtpRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;

  useEffect(() => {
    if (language) {
      setTimeout(() => setSelectedLanguage(language), 0);
    }
  }, [language]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setEmailNotifs(user.emailNotifs !== undefined ? user.emailNotifs : true);
        setSmsNotifs(user.smsNotifs !== undefined ? user.smsNotifs : true);
        setAppNotifs(user.appNotifs !== undefined ? user.appNotifs : true);
        setStatusUpdates(user.statusUpdates !== undefined ? user.statusUpdates : true);
      }, 0);
    }
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

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
    
    if (password.length < 8) {
      showStatus("Password must be at least 8 characters.", "error");
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
      if (res.ok) {
        setPassword(""); setConfirmPassword("");
        showStatus("Password updated successfully.");
      } else {
        const errData = await res.json().catch(() => ({}));
        showStatus(errData.error || "Failed to update password.", "error");
      }
    } catch {
      showStatus("Could not connect to server.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifSave = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifs, smsNotifs, appNotifs, statusUpdates }),
        ...FETCH_OPTS,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
        showStatus("Notification preferences saved. ✓");
      } else {
        showStatus("Failed to save notification preferences.", "error");
      }
    } catch {
      showStatus("Could not connect to server.", "error");
    }
  };

  const handleAadhaarOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const newOtp = [...aadhaarOtpValues];
      newOtp[index] = "";
      setAadhaarOtpValues(newOtp);
      return;
    }
    const newOtp = [...aadhaarOtpValues];
    newOtp[index] = cleanValue[cleanValue.length - 1];
    setAadhaarOtpValues(newOtp);

    if (index < 5 && cleanValue) {
      aadhaarOtpRefs[index + 1].current?.focus();
    }
  };

  const handleAadhaarOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!aadhaarOtpValues[index] && index > 0) {
        const newOtp = [...aadhaarOtpValues];
        newOtp[index - 1] = "";
        setAadhaarOtpValues(newOtp);
        aadhaarOtpRefs[index - 1].current?.focus();
      }
    }
  };

  const handleAadhaarOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split("");
      setAadhaarOtpValues(newOtp);
      aadhaarOtpRefs[5].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const clean = aadhaarNum.replace(/\s+/g, "");
      const res = await fetch(`${API}/api/auth/aadhaar/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNum: clean }),
        ...FETCH_OPTS,
      });
      const data = await res.json();
      if (res.ok) {
        setTimer(60);
        if (data.otp) setDemoAadhaarOtp(data.otp);
        setAadhaarOtpValues(["", "", "", "", "", ""]);
        showStatus("OTP resent successfully! Check your email. ✓");

      } else {
        showStatus(data.error || "Failed to resend OTP.", "error");
      }
    } catch {
      showStatus("Could not connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    const clean = aadhaarNum.replace(/\s+/g, "");
    if (aadhaarStep === 1) {
      if (clean.length !== 12 || isNaN(clean)) {
        showStatus("Invalid Aadhaar: must be exactly 12 digits.", "error");
        return;
      }
      if (!validateVerhoeff(clean)) {
        showStatus("Invalid Aadhaar: checksum verification failed.", "error");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/auth/aadhaar/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadhaarNum: clean }),
          ...FETCH_OPTS,
        });
        const data = await res.json();
        if (res.ok) {
          setTimer(60);
          setAadhaarStep(2);
          if (data.otp) setDemoAadhaarOtp(data.otp);
          setAadhaarOtpValues(["", "", "", "", "", ""]);
          showStatus("Verification OTP sent to your registered email! ✓");

        } else {
          showStatus(data.error || "Failed to request Aadhaar verification OTP.", "error");
        }
      } catch {
        showStatus("Could not connect to server.", "error");
      } finally {
        setLoading(false);
      }
    } else if (aadhaarStep === 2) {
      const fullOtp = aadhaarOtpValues.join("");
      if (fullOtp.length < 6) {
        showStatus("Please enter a valid 6-digit verification code.", "error");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/auth/aadhaar/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: fullOtp }),
          ...FETCH_OPTS,
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          setAadhaarStep(3);
          showStatus("Aadhaar verified and linked successfully! ✓");
        } else {
          showStatus(data.error || "Failed to verify OTP.", "error");
        }
      } catch {
        showStatus("Could not connect to server.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoAadhaarAutofill = () => {
    if (demoAadhaarOtp && demoAadhaarOtp.length === 6) {
      setAadhaarOtpValues(demoAadhaarOtp.split(""));
      aadhaarOtpRefs[5].current?.focus();
    }
  };

  const handleDigiLockerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDigiLockerLinked: true }),
        ...FETCH_OPTS,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
        setDigiLockerStep(2);
        showStatus("DigiLocker linked successfully! ✓");
      } else {
        showStatus("Failed to link DigiLocker.", "error");
      }
    } catch {
      showStatus("Could not connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLanguageSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage }),
        ...FETCH_OPTS,
      });
      if (res.ok) {
        setLanguage(selectedLanguage);
        showStatus("Language preference saved in profile! ✓");
      } else {
        setLanguage(selectedLanguage);
        showStatus("Language applied locally. ✓");
      }
    } catch {
      setLanguage(selectedLanguage);
      showStatus("Language applied locally. ✓");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t("account_settings")}</h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">{t("account_settings_sub")}</p>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-slide-up shadow-lg max-w-sm ${
          statusType === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-500/10"
            : "bg-red-50 border-red-200 text-red-600 shadow-red-500/10"
        }`}>
          {statusType === "success"
            ? <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 text-emerald-600" />
            : <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-600" />}
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
                <CardTitle className="text-sm font-bold text-slate-900">{t("profile_details")}</CardTitle>
                <CardDescription className="text-xs">{t("profile_sub")}</CardDescription>
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
                          {t("new_photo_ready")}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a56db] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {t("verified_citizen")}
                        </span>
                      )}
                    </div>
                    {avatarFile && (
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                        className="text-[10px] text-red-500 hover:underline mt-1 block">
                        {t("remove_photo")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t("full_name")} id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label={t("email_address")} id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <Input
                  label={t("phone_number")}
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
                  {t("save_profile")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Physical Aadhaar Card Preview */}
          {user?.isAadhaarLinked && (
            <Card className="bg-white border border-slate-200/80 shadow-sm overflow-hidden" hover={false}>
              <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">{t("physical_aadhaar_preview")}</CardTitle>
                  <CardDescription className="text-xs">{t("physical_aadhaar_preview_sub")}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                  
                  {/* FRONT SIDE */}
                  <div className="relative w-full max-w-[340px] h-[215px] rounded-xl border border-slate-200 shadow-md bg-white overflow-hidden flex flex-col font-sans text-slate-800">
                    {/* Tricolor top header */}
                    <div className="h-1.5 flex w-full">
                      <div className="flex-1 bg-[#FF9933]"></div>
                      <div className="flex-1 bg-white"></div>
                      <div className="flex-1 bg-[#138808]"></div>
                    </div>
                    {/* UIDAI Gov Header */}
                    <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Aadhaar_Logo.svg" 
                        alt="Aadhaar" 
                        className="h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="text-right">
                        <div className="text-[7.5px] font-bold text-slate-900 leading-tight">भारतीय विशिष्ट पहचान प्राधिकरण</div>
                        <div className="text-[6.5px] font-bold text-slate-500 uppercase tracking-tighter">Unique Identification Authority of India</div>
                      </div>
                    </div>
                    {/* Main content body */}
                    <div className="flex-1 px-3 py-2 flex gap-3">
                      {/* Left: Photo */}
                      <div className="w-[70px] h-[85px] bg-slate-50 rounded border border-slate-200 p-0.5 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={user?.aadhaarData?.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || "citizen")}&backgroundColor=b6e3f4`}
                          alt="Citizen"
                          className="w-full h-full object-cover rounded-sm"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-[5px] text-white text-center py-0.5 font-bold uppercase tracking-wider">VERIFIED</div>
                      </div>
                      
                      {/* Right: Info */}
                      <div className="flex-1 flex flex-col justify-center text-[10px] space-y-1.5">
                        <div>
                          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider leading-none">Name / नाम</div>
                          <div className="font-bold text-slate-900 leading-tight">{user?.aadhaarData?.name || user?.name?.toUpperCase()}</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider leading-none">DOB / जन्म तिथि</div>
                          <div className="font-bold text-slate-900 leading-tight">{user?.aadhaarData?.dob || "12/04/1995"}</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider leading-none">Gender / लिंग</div>
                          <div className="font-bold text-slate-900 leading-tight">{user?.aadhaarData?.gender || "MALE"}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer with Aadhaar Number */}
                    <div className="bg-slate-50 border-t border-slate-100 py-1.5 px-3 flex flex-col items-center justify-center relative">
                      <div className="text-xs font-extrabold text-[#d93838] tracking-widest font-mono">
                        {user?.aadhaarNum || "XXXX XXXX 9182"}
                      </div>
                      <div className="text-[6.5px] font-bold text-slate-400 tracking-wider mt-0.5">मेरा आधार, मेरी पहचान</div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="relative w-full max-w-[340px] h-[215px] rounded-xl border border-slate-200 shadow-md bg-white overflow-hidden flex flex-col font-sans text-slate-800">
                    {/* Tricolor top header */}
                    <div className="h-1.5 flex w-full">
                      <div className="flex-1 bg-[#FF9933]"></div>
                      <div className="flex-1 bg-white"></div>
                      <div className="flex-1 bg-[#138808]"></div>
                    </div>
                    {/* Header */}
                    <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="text-[7.5px] font-bold text-slate-700">भारत सरकार (GOVERNMENT OF INDIA)</div>
                      <span className="text-[7px] font-extrabold text-blue-800 uppercase tracking-widest bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-sm">UIDAI</span>
                    </div>
                    {/* Main content body */}
                    <div className="flex-1 px-3 py-2 flex gap-3 items-center">
                      {/* Left: Address details */}
                      <div className="flex-1 text-[9px] leading-relaxed">
                        <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Address / पता</div>
                        <div className="text-slate-700 font-medium leading-tight pr-1 max-h-[80px] overflow-y-auto font-mono">
                          {user?.aadhaarData?.address || "H No 142/A, Gali No 4, Block B, Vikas Nagar, Uttam Nagar, West Delhi, Delhi - 110059"}
                        </div>
                      </div>
                      
                      {/* Right: QR Code placeholder */}
                      <div className="w-[70px] h-[70px] bg-slate-50 rounded border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center relative">
                        <div className="w-full h-full border border-slate-300 flex flex-col items-center justify-center bg-white p-1 rounded-sm shadow-inner">
                          <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100">
                            <rect x="0" y="0" width="20" height="20" fill="currentColor"/>
                            <rect x="5" y="5" width="10" height="10" fill="white"/>
                            
                            <rect x="80" y="0" width="20" height="20" fill="currentColor"/>
                            <rect x="85" y="5" width="10" height="10" fill="white"/>
                            
                            <rect x="0" y="80" width="20" height="20" fill="currentColor"/>
                            <rect x="5" y="85" width="10" height="10" fill="white"/>
                            
                            <rect x="30" y="10" width="10" height="20" fill="currentColor"/>
                            <rect x="50" y="0" width="20" height="10" fill="currentColor"/>
                            <rect x="30" y="40" width="20" height="20" fill="currentColor"/>
                            <rect x="10" y="30" width="10" height="10" fill="currentColor"/>
                            <rect x="60" y="30" width="10" height="30" fill="currentColor"/>
                            <rect x="80" y="50" width="10" height="20" fill="currentColor"/>
                            <rect x="30" y="70" width="30" height="10" fill="currentColor"/>
                            <rect x="10" y="60" width="10" height="10" fill="currentColor"/>
                            <rect x="70" y="80" width="20" height="10" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer with Aadhaar Number */}
                    <div className="bg-slate-50 border-t border-slate-100 py-1.5 px-3 flex flex-col items-center justify-center">
                      <div className="text-xs font-extrabold text-slate-800 tracking-widest font-mono">
                        {user?.aadhaarNum || "XXXX XXXX 9182"}
                      </div>
                      <div className="text-[6.5px] font-bold text-slate-400 tracking-wider mt-0.5">Unique Identification Authority of India</div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Security */}
          <Card className="bg-white border border-slate-200/80 shadow-sm" hover={false}>
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">{t("account_security")}</CardTitle>
                <CardDescription className="text-xs">{t("security_sub")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t("new_password")} id="new-password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Input label={t("confirm_password")} id="confirm-password" type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-semibold">
                  {t("password_requirement")}
                </div>
                <Button
                  type="submit"
                  isLoading={pwLoading}
                  variant="outline"
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  {t("update_password")}
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
                <CardTitle className="text-sm font-bold text-slate-900">{t("notification_pref")}</CardTitle>
                <CardDescription className="text-xs">{t("notification_sub")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
                { id: "email-notifs", label: t("email_alerts_label"), sub: t("email_alerts_sub"), icon: Mail, value: emailNotifs, setter: setEmailNotifs },
                { id: "sms-notifs", label: t("sms_alerts_label"), sub: t("sms_alerts_sub"), icon: Phone, value: smsNotifs, setter: setSmsNotifs },
                { id: "app-notifs", label: t("app_alerts_label"), sub: t("app_alerts_sub"), icon: Bell, value: appNotifs, setter: setAppNotifs },
                { id: "status-notifs", label: t("status_alerts_label"), sub: t("status_alerts_sub"), icon: CheckCircle, value: statusUpdates, setter: setStatusUpdates },
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
                {t("save_preferences")}
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
                <CardTitle className="text-sm font-bold text-slate-900">{t("language_pref")}</CardTitle>
                <CardDescription className="text-xs">{t("language_sub")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "mr", label: "मराठी" },
                  { code: "bn", label: "বাংলা" },
                  { code: "ur", label: "اردو" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLanguage === lang.code
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
                {t("apply_language")}
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
                <CardTitle className="text-sm font-bold text-slate-900">{t("account_status")}</CardTitle>
                <CardDescription className="text-xs">{t("account_status_sub")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {/* Email Verified */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{t("email_verified")}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${user?.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                  {user?.isVerified ? t("verified") : t("pending")}
                </span>
              </div>

              {/* Aadhaar Linked */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{t("aadhaar_linked")}</span>
                {user?.isAadhaarLinked ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                    {t("linked")}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-600 border-amber-100">
                      {t("pending")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAadhaarModal(true);
                        setAadhaarStep(1);
                        setAadhaarNum("");
                        setAadhaarOtpValues(["", "", "", "", "", ""]);
                      }}
                      className="text-[10px] font-bold text-[#1a56db] hover:underline"
                    >
                      {t("link_now")}
                    </button>
                  </div>
                )}
              </div>

              {/* DigiLocker Access */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{t("digilocker_access")}</span>
                {user?.isDigiLockerLinked ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                    {t("linked")}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-500 border-slate-200">
                      {t("not_linked")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDigiLockerModal(true)}
                      className="text-[10px] font-bold text-[#1a56db] hover:underline"
                    >
                      {t("link_now")}
                    </button>
                  </div>
                )}
              </div>

              {/* Account Type */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{t("account_type")}</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-blue-50 text-[#1a56db] border-blue-100">
                  {user?.role === "admin" ? t("admin") : t("citizen")}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Aadhaar Modal */}
      {showAadhaarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t("verification_otp_title")}</h3>
            
            {aadhaarStep === 1 && (
              <form onSubmit={handleAadhaarSubmit} className="space-y-4">
                <Input
                  label={t("enter_12_digit_aadhaar")}
                  id="aadhaar-num"
                  placeholder="xxxx xxxx xxxx"
                  maxLength={14}
                  value={aadhaarNum}
                  onChange={(e) => setAadhaarNum(formatAadhaar(e.target.value))}
                  required
                />
                
                {aadhaarNum.replace(/\s+/g, "").length === 12 && !validateVerhoeff(aadhaarNum) && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-semibold flex flex-col gap-1">
                    <span>⚠️ {t("aadhaar_checksum_err")}</span>
                    <span>{t("aadhaar_test_tip_click")}</span>
                    <button
                      type="button"
                      onClick={() => setAadhaarNum(formatAadhaar("365892059182"))}
                      className="mt-1 self-start px-2 py-0.5 rounded bg-amber-200 text-amber-800 hover:bg-amber-300 font-bold transition-all text-[9px]"
                    >
                      3658 9205 9182
                    </button>
                  </div>
                )}

                {aadhaarNum.replace(/\s+/g, "").length < 12 && (
                  <div className="text-[10px] text-slate-400 font-medium">
                    {t("aadhaar_test_tip")}{" "}
                    <button
                      type="button"
                      onClick={() => setAadhaarNum(formatAadhaar("365892059182"))}
                      className="text-[#1a56db] font-bold hover:underline"
                    >
                      3658 9205 9182
                    </button>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" className="text-xs px-4 py-2" onClick={() => setShowAadhaarModal(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" isLoading={loading} className="bg-[#1a56db] text-white font-bold text-xs px-4 py-2 rounded-xl">
                    {t("verify")}
                  </Button>
                </div>
              </form>
            )}

            {aadhaarStep === 2 && (
              <form onSubmit={handleAadhaarSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block text-center mb-1">
                    {t("verification_otp")}
                  </label>
                  <div className="flex justify-between gap-2" onPaste={handleAadhaarOtpPaste}>
                    {aadhaarOtpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={aadhaarOtpRefs[idx]}
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={val}
                        onFocus={e => e.target.select()}
                        onChange={e => handleAadhaarOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleAadhaarOtpKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-bold text-slate-900 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    ))}
                  </div>
                </div>

                {demoAadhaarOtp && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs flex items-center justify-between mt-3 animate-fade-in">
                    <span className="text-slate-700 font-semibold">{t("demo_otp_label")} <strong className="font-mono text-blue-700 text-sm tracking-wider">{demoAadhaarOtp}</strong></span>
                    <button
                      type="button"
                      onClick={handleDemoAadhaarAutofill}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors uppercase tracking-wider"
                    >
                      {t("autofill")}
                    </button>
                  </div>
                )}


                
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed text-center">
                  {t("otp_sent_info")}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold py-1">
                  {timer > 0 ? (
                    <span>{t("resend_code_in")} <strong className="text-[#1a56db] font-bold">{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#1a56db] font-bold hover:underline"
                    >
                      {t("resend_otp_code")}
                    </button>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" className="text-xs px-4 py-2" onClick={() => { setAadhaarStep(1); setAadhaarOtpValues(["", "", "", "", "", ""]); }}>
                    {t("back")}
                  </Button>
                  <Button type="submit" isLoading={loading} className="bg-[#1a56db] text-white font-bold text-xs px-4 py-2 rounded-xl">
                    {t("submit")}
                  </Button>
                </div>
              </form>
            )}

            {aadhaarStep === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">{t("link_success")}</p>
                <Button type="button" className="bg-[#1a56db] text-white text-xs px-6 py-2 rounded-xl" onClick={() => { setShowAadhaarModal(false); setAadhaarStep(1); setAadhaarNum(""); setAadhaarOtp(""); setAadhaarOtpValues(["", "", "", "", "", ""]); }}>
                  {t("done")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DigiLocker Modal */}
      {showDigiLockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t("digilocker_popup_title")}</h3>
            
            {digiLockerStep === 1 && (
              <form onSubmit={handleDigiLockerSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("digilocker_login_desc")}
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1a56db]" />
                  <span className="text-[10px] font-bold text-slate-700">{t("sign_in_with_meripehchaan")}</span>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" className="text-xs px-4 py-2" onClick={() => setShowDigiLockerModal(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" isLoading={loading} className="bg-[#1a56db] text-white font-bold text-xs px-4 py-2 rounded-xl">
                    {t("link_digilocker")}
                  </Button>
                </div>
              </form>
            )}

            {digiLockerStep === 2 && (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">{t("link_success")}</p>
                <Button type="button" className="bg-[#1a56db] text-white text-xs px-6 py-2 rounded-xl" onClick={() => { setShowDigiLockerModal(false); setDigiLockerStep(1); }}>
                  {t("done")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
