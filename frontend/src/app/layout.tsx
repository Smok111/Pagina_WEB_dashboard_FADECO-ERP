import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { AccessibilityProvider } from "@/providers/AccessibilityProvider";
import AccessibilityMenu from "@/components/layout/AccessibilityMenu";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FADECO ERP",
  description: "Sistema ERP empresarial moderno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AccessibilityProvider>
          <AuthProvider>{children}</AuthProvider>
          <AccessibilityMenu />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
