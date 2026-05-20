import React from "react";

export function Card({ children, className = "", hover = true, ...props }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${hover ? "hover:shadow-md" : ""} ${className}`}
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
  return (
    <h3 className={`font-bold text-slate-900 text-base leading-snug ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`} {...props}>
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
