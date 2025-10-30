import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "700"], // Reduced weights to only essential ones
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Workout Tracker - Weight Lifting Club",
  description:
    "Track workouts, progress, and schedules for weight lifting club members",
  keywords:
    "workout, fitness, weight lifting, gym, progress tracking, mobile app",
  authors: [{ name: "Weight Lifting Club" }],

  // PWA manifest
  manifest: "/manifest.json",

  // App icons
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/icon-192x192.png",
  },

  // Mobile app capabilities
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Workout Tracker",
  },

  // Open Graph for social sharing
  openGraph: {
    title: "Workout Tracker - Weight Lifting Club",
    description:
      "Track workouts, progress, and schedules for weight lifting club members",
    type: "website",
    siteName: "Workout Tracker",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#334155" }, // Navy-700 from design tokens
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }, // Navy-900 from design tokens
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-white`}
      >
        <AuthProvider>
          <Navigation />
          <main className="bg-white">{children}</main>
          <PWAInstallBanner />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
