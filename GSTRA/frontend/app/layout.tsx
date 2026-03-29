import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GSTRA",
  description: "GenAI GST compliance assistant for MSMEs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
