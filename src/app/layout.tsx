import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins", 
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Workout Tracker - Weight Lifting Club",
  description: "Track workouts, progress, and schedules for weight lifting club members",
  keywords: "workout, fitness, weight lifting, gym, progress tracking, mobile app",
  authors: [{ name: "Weight Lifting Club" }],
  
  // PWA manifest
  manifest: '/manifest.json',
  
  // Mobile app capabilities
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Workout Tracker',
  },
  
  // Open Graph for social sharing
  openGraph: {
    title: 'Workout Tracker - Weight Lifting Club',
    description: 'Track workouts, progress, and schedules for weight lifting club members',
    type: 'website',
    siteName: 'Workout Tracker',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a8a' }, // Navy blue
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },  // Darker navy
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
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
