import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "GSTRA",
  description: "GenAI GST compliance assistant for MSMEs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
