import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkoutSessionProvider } from "@/contexts/WorkoutSessionContext";
import { ToastProvider } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { ClientUIWrapper } from "@/components/ClientUIWrapper";
import PageTransition from "@/components/PageTransition";
import { SkipLink } from "@/components/SkipLink";
import { initializeDevelopmentEnvironment } from "@/lib/dev-init";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";
import { BottomNavWrapper } from "@/components/navigation/BottomNavWrapper";

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
  fallback: ["system-ui", "arial"],
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
  other: {
    "dns-prefetch": process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    preconnect: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility (WCAG 2.1 - 1.4.4)
  userScalable: true, // Enable user scaling for better accessibility
  viewportFit: "cover", // Support for iOS notch/Dynamic Island
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <head>
        {/* Aggressive resource hints for LCP */}
        <link
          rel="preconnect"
          href="https://lzsjaqkhdoqsafptqpnt.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://lzsjaqkhdoqsafptqpnt.supabase.co"
        />
        <link
          rel="preconnect"
          href="https://vercel.live"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://vercel.live" />

        {/* Prefetch critical resources */}
        <link rel="prefetch" href="/api/auth/session" />
      </head>
      <body>
        <GlobalErrorBoundary>
          <AuthProvider>
            <WorkoutSessionProvider>
              <ToastProvider>
                <ClientUIWrapper>
                  <SkipLink targetId="main-content">
                    Skip to main content
                  </SkipLink>
                  <Navigation />
                  {/* Add padding to compensate for fixed navigation */}
                  <main
                    id="main-content"
                    tabIndex={-1}
                    className="pt-16 sm:pt-18"
                    style={{
                      position: "relative",
                      zIndex: 1,
                      minHeight: "100vh",
                    }}
                  >
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <BottomNavWrapper />
                  <ServiceWorkerRegistration />
                </ClientUIWrapper>
              </ToastProvider>
            </WorkoutSessionProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
        {/* Analytics: Deferred to absolute end, zero impact on initial load */}
        {process.env.NODE_ENV === "production" && <AnalyticsWrapper />}
      </body>
    </html>
  );
}
