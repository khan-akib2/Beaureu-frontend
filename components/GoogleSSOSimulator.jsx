import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { X, Sparkles, User, Mail, ShieldAlert } from "lucide-react";

export default function GoogleSSOSimulator({ isOpen, onClose, onSimulate, isLoading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const quickProfiles = [
    { name: "Priya Patel", email: "priya.patel@gmail.com", avatar: "Priya" },
    { name: "Rahul Kumar", email: "rahul.kumar@gmail.com", avatar: "Rahul" },
    { name: "Ananya Iyer", email: "ananya.iyer@bureauai.in", avatar: "Ananya" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Please enter both Name and Email address.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const picture = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    onSimulate({ name, email, picture });
  };

  const selectProfile = (profile) => {
    setName(profile.name);
    setEmail(profile.email);
    setError("");
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white px-6 py-5 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Google SSO Simulator</h3>
              <p className="text-blue-200 text-xs mt-1.5 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-300" /> Local Development Testing Mode
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6">
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Since no Google Client ID is configured in <code className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono rounded">.env.local</code>, this simulator allows you to log in with <strong>any</strong> account dynamically.
          </p>

          {/* Quick Select Profiles */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Select Profile</label>
            <div className="grid grid-cols-1 gap-2">
              {quickProfiles.map((profile) => (
                <button
                  key={profile.email}
                  type="button"
                  onClick={() => selectProfile(profile)}
                  className="flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile.avatar}`} 
                    alt={profile.name} 
                    className="w-8 h-8 rounded-lg bg-slate-100 p-0.5 border border-slate-200 group-hover:border-blue-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-900">{profile.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-slate-400 font-semibold uppercase tracking-wider">or enter custom details</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              <Input
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Google Email Address
              </label>
              <Input
                type="email"
                placeholder="aarav@bureauai.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 justify-center"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1 justify-center bg-[#1a56db] hover:bg-blue-700"
              >
                Simulate Sign-In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
