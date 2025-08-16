import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add DM Sans (normal + italic; weights needed by the Figma)
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Migrate Mate | Profile",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Expose all font CSS variables to Tailwind
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable}`}
    >
      {/* Keep the site default as-is; components can opt into DM Sans via `font-dm` */}
      <body className="antialiased">{children}</body>
    </html>
  );
}