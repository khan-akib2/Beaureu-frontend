import React from "react";

export default function Badge({ children, className = "", variant = "info", ...props }) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border";

  const variants = {
    info:    "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    danger:  "bg-red-50 border-red-200 text-red-700",
    neutral: "bg-slate-100 border-slate-200 text-slate-600",
    glow:    "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <span className={`${base} ${variants[variant] || variants.neutral} ${className}`} {...props}>
      {children}
    </span>
  );
}
