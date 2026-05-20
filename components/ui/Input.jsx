import React from "react";

export default function Input({ className = "", error = "", label = "", id, type = "text", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 placeholder-slate-400 outline-none transition-all text-sm ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
