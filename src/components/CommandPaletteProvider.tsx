"use client";

import { CommandPalette, useCommandPalette } from "./CommandPalette";

/**
 * Global Command Palette Provider
 * Wraps the app to provide Cmd+K command palette functionality
 * Automatically handles keyboard shortcuts (Cmd+K / Ctrl+K)
 */
export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useCommandPalette();

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
