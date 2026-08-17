import type { Metadata } from "next";
import "@/styles/globals.css";
import { BRANDING } from "@/lib/constants/branding";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: `${BRANDING.name} — Enterprise Product Intelligence Platform`,
  description: BRANDING.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50" suppressHydrationWarning>
      <body className="h-full font-sans antialiased text-slate-900 bg-[#F8FAFC]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

