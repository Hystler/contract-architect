import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Architect",
  description: "Шаблонный генератор договоров и актов на русском языке"
};

const displayFont = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const sansFont = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
