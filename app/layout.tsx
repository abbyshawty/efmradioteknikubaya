import type { Metadata, Viewport } from "next";
import { Poppins, DM_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ParticleNet from "@/components/ParticleNet";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dmmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "107.9 E-FM - Radio Kampus Universitas Surabaya",
  description: "Fresh Your Mind with Edutainment Radio. Radio kampus Fakultas Teknik Universitas Surabaya.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${dmMono.variable}`}>
      <body>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
        <ParticleNet />
        {children}
      </body>
    </html>
  );
}
