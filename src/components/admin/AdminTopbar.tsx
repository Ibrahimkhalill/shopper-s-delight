"use client";

import { Menu, Search, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  onMenuClick: () => void;
  title: string;
}

export function AdminTopbar({ onMenuClick, title }: Props) {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime(now.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      }) + " · " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
      >
        <Menu className="size-5 text-slate-600" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-800 truncate">{title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{dateTime}</p>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-3 h-9 w-56">
        <Search className="size-3.5 text-slate-400 shrink-0" />
        <input
          placeholder="Search..."
          className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <button className="relative p-2 rounded-xl hover:bg-slate-100 transition">
        <Bell className="size-5 text-slate-500" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}
