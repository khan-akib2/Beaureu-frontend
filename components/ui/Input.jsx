import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ className = "", error = "", label = "", id, type = "text", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type={inputType}
          id={id}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 placeholder-slate-400 outline-none transition-all text-sm ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
