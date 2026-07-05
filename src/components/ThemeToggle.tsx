"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:shadow-sm"
      title={dark ? "Mode Terang" : "Mode Gelap"}
      aria-label="Toggle theme"
    >
      <span className="block transition-transform duration-300" style={{ transform: dark ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
    </button>
  );
}
