import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Nasla Export", template: "%s | Nasla Export" },
  description: "Digital platform for domains, websites, templates and export business digitalization.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body><Header />{children}<Footer /></body></html>;
}