import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { initializeDevelopmentEnvironment } from "@/lib/dev-init";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";

// Initialize development environment (only in dev)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  initializeDevelopmentEnvironment();
}

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
  title: "LiteWork - Weight Lifting Tracker",
  description:
    "Track your weight lifting workouts, manage athlete groups, and monitor progress with LiteWork.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LiteWork",
  },
  formatDetection: {
    telephone: false,
  },

  // Performance: Preconnect to critical external domains
  other: {
    preconnect: "https://fonts.googleapis.com",
    "dns-prefetch": "https://fonts.gstatic.com",
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Preconnect to Supabase for faster API calls */}
        <link
          rel="preconnect"
          href="https://xnodqasubbpvxonrqhkp.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://xnodqasubbpvxonrqhkp.supabase.co"
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-white`}
      >
        <GlobalErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <Navigation />
              {/* Add padding to compensate for fixed navigation */}
              <main className="bg-white pt-16 sm:pt-18">{children}</main>
              <PWAInstallBanner />
              <ServiceWorkerRegistration />
            </ToastProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <WebVitalsTracker />
      </body>
    </html>
  );
}
