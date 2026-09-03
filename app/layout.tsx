import type { Metadata } from "next";
import { Newsreader, Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-heading",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LivingWord — Personal Church & Sermon Notes",
  description: "Create, organize, summarize, and ask questions about your sermon notes using AI and interactive Scripture references.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${cinzel.variable} ${plusJakartaSans.variable}`}>
      <body className="antialiased selection:bg-[#C59B27]/20 selection:text-[#1A1815]">
        {children}
      </body>
    </html>
  );
}
