"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, LayoutDashboard, MessageCircle, Menu, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Chat Advisor", icon: MessageCircle },
  { href: "/invoice", label: "Invoice Analyzer", icon: FileSearch },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-50 md:flex">
        <div className="p-6">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-wide text-rose-500">GSTRA</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">GST. Simplified.</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-rose-700 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-xl bg-slate-800 p-4 text-xs text-slate-400">
            <p className="font-semibold text-slate-200 mb-1">Need help?</p>
            <p>Our AI is learning to provide better GST guidance.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex w-full flex-col min-h-[100dvh]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md md:hidden">
          <div>
            <h1 className="text-xl font-black tracking-wide text-rose-700">GSTRA</h1>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full justify-around border-t border-slate-200 bg-white px-2 py-2 pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center rounded-lg p-2 min-w-[4rem] transition-colors ${
                active ? "text-rose-700" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={22} className={active ? "fill-rose-100" : ""} />
              <span className="mt-1 text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
