"use client";

import dynamic from "next/dynamic";

// Lazy load non-critical UI features
const PWAInstallBanner = dynamic(
  () => import("@/components/PWAInstallBanner"),
  { ssr: false }
);
const KeyboardShortcutsHelp = dynamic(
  () =>
    import("@/components/KeyboardShortcutsHelp").then((m) => ({
      default: m.KeyboardShortcutsHelp,
    })),
  { ssr: false }
);
const CommandPaletteProvider = dynamic(
  () =>
    import("@/components/CommandPaletteProvider").then((m) => ({
      default: m.CommandPaletteProvider,
    })),
  { ssr: false }
);

/**
 * Client-side UI features wrapper
 * Lazy loads PWA, keyboard shortcuts, and command palette to improve initial load
 */
export function ClientUIWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      {children}
      <PWAInstallBanner />
      <KeyboardShortcutsHelp />
    </CommandPaletteProvider>
  );
}
