"use client";

import React, { useEffect, useState } from "react";
import { Sun } from "lucide-react";

// ThemeToggle is kept for UI completeness but always returns to light
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always enforce light mode — remove any dark class
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[#1a56db]"
      title="Light mode active"
    >
      <Sun className="w-4 h-4" />
    </div>
  );
}
