import React from "react";

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:   "bg-[#1a56db] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white shadow-sm focus:ring-[#1a56db]/40",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-300",
    outline:   "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-300",
    ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
    danger:    "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-400",
    success:   "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-400",
    glass:     "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm focus:ring-slate-300",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
