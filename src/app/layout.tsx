import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Architect",
  description: "Шаблонный генератор договоров и актов на русском языке"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
