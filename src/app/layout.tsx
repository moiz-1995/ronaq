import type { Metadata, Viewport } from "next";
import { Bungee, Bungee_Shade, Rubik } from "next/font/google";
import "./globals.css";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee", display: "swap" });
const bungeeShade = Bungee_Shade({ weight: "400", subsets: ["latin"], variable: "--font-bungee-shade", display: "swap" });
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ronaq — apki ronaq, ek jagah", template: "%s · Ronaq" },
  description: "Find henna artists, caterers, decorators, photographers and more in Rawalpindi and Islamabad, and plan your whole event in one place.",
};

export const viewport: Viewport = { themeColor: "#1b1340", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bungee.variable} ${bungeeShade.variable} ${rubik.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
