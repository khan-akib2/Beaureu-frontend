import React from "react";

export function Card({ children, className = "", hover = true, glass = true, ...props }) {
  return (
    <div
      className={`${glass ? "glass-card" : ""} rounded-2xl p-6 ${hover ? "hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  const hasColor = className.includes("text-");
  return (
    <h3 className={`font-bold text-base leading-snug ${hasColor ? "" : "text-slate-900"} ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  const hasColor = className.includes("text-");
  return (
    <p className={`text-xs leading-relaxed ${hasColor ? "" : "text-slate-500"} ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}
