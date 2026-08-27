import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ShajSutro",
    template: "%s | ShajSutro",
  },
  description:
    "Thoughtfully crafted clothing for the modern wardrobe. Minimalist designs, premium materials, enduring style.",
  keywords: ["clothing", "fashion", "minimalist", "ShajSutro", "sustainable"],
  icons: {
    icon: "/images/shajsutro-logo.png",
  },
  openGraph: {
    title: "ShajSutro",
    description: "Thoughtfully crafted clothing for the modern wardrobe.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
