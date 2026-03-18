"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, LayoutDashboard, MessageCircle } from "lucide-react";
import { ReactNode } from "react";

const links = [
  { href: "/", label: "Chat", icon: MessageCircle },
  { href: "/invoice", label: "Invoice", icon: FileSearch },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3A1313] via-[#5A1918] to-[#AA3A2A] text-[#F9F1E7]">
      <div className="mx-auto flex w-full max-w-[1400px] gap-4 p-4 md:p-6">
        <aside className="hidden w-60 shrink-0 rounded-2xl border border-[#F9F1E7]/20 bg-black/20 p-4 backdrop-blur md:block">
          <h1 className="text-2xl font-black tracking-wide">GSTRA</h1>
          <p className="mt-1 text-sm text-[#F9F1E7]/80">GST. Simplified.</p>
          <nav className="mt-8 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                    active ? "bg-[#7B1C1C] text-white" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="w-full rounded-2xl border border-[#F9F1E7]/20 bg-[#F9F1E7] text-[#2A1616] shadow-warm">
          <header className="flex items-center justify-between border-b border-[#7B1C1C]/15 px-4 py-3 md:px-6">
            <div>
              <p className="text-xl font-black tracking-wide text-[#7B1C1C]">GSTRA</p>
              <p className="text-sm text-[#7B1C1C]/80">GST. Simplified.</p>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
