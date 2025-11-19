import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkoutSessionProvider } from "@/contexts/WorkoutSessionContext";
import { ToastProvider } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { CommandPaletteProvider } from "@/components/CommandPaletteProvider";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import PageTransition from "@/components/PageTransition";
import { SkipLink } from "@/components/SkipLink";
import { initializeDevelopmentEnvironment } from "@/lib/dev-init";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";

// Initialize development environment (only in dev)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  initializeDevelopmentEnvironment();
}

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const poppins = localFont({
  src: [
    {
      path: "./fonts/Poppins-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
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
  other: {},
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
        {/* Preconnect to Supabase for faster API calls */}
        <link
          rel="preconnect"
          href="https://lzsjaqkhdoqsafptqpnt.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://lzsjaqkhdoqsafptqpnt.supabase.co"
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-white`}
      >
        <GlobalErrorBoundary>
          <AuthProvider>
            <WorkoutSessionProvider>
              <ToastProvider>
                <CommandPaletteProvider>
                  <SkipLink targetId="main-content">
                    Skip to main content
                  </SkipLink>
                  <Navigation />
                  {/* Add padding to compensate for fixed navigation */}
                  <main
                    id="main-content"
                    tabIndex={-1}
                    className="bg-white pt-16 sm:pt-18"
                  >
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <PWAInstallBanner />
                  <ServiceWorkerRegistration />
                  <KeyboardShortcutsHelp />
                </CommandPaletteProvider>
              </ToastProvider>
            </WorkoutSessionProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <WebVitalsTracker />
      </body>
    </html>
  );
}
