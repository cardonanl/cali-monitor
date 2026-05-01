import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monitor Cali — Noticias en tiempo real",
  description: "Dashboard de noticias de Cali y el Valle del Cauca, actualizado automáticamente cada 30 minutos.",
  openGraph: {
    title: "Monitor Cali",
    description: "Noticias de Cali y el Valle del Cauca en tiempo real",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
