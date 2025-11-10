"use client";

import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts organized by category
 * Opens with ? key or Shift+?
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Open with ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "General",
      shortcuts: [
        { keys: `${modKey}+K`, description: "Open command palette" },
        { keys: "?", description: "Show keyboard shortcuts" },
        { keys: "Esc", description: "Close modal/dialog" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { keys: "H", description: "Go to dashboard" },
        { keys: "/", description: "Focus search" },
        { keys: ",", description: "Open settings" },
      ],
    },
    {
      title: "Actions",
      shortcuts: [
        { keys: "N", description: "Create new workout" },
        { keys: "E", description: "Create new exercise" },
        { keys: `${modKey}+S`, description: "Save (when editing)" },
      ],
    },
    {
      title: "Command Palette",
      shortcuts: [
        { keys: "↑↓", description: "Navigate options" },
        { keys: "Enter", description: "Select option" },
        { keys: "Esc", description: "Close palette" },
      ],
    },
    {
      title: "Exercise Search",
      shortcuts: [
        { keys: "↑↓", description: "Navigate results" },
        { keys: "Enter", description: "Select exercise" },
        { keys: "Esc", description: "Close dropdown" },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden">
        <ModalHeader
          title="Keyboard Shortcuts"
          icon={<Keyboard className="w-6 h-6" />}
          onClose={() => setIsOpen(false)}
        />

        <ModalContent>
          <div className="space-y-6">
            <p className="text-sm text-silver-600">
              Use these keyboard shortcuts to navigate and perform actions
              quickly throughout LiteWork.
            </p>

            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-silver-50"
                    >
                      <span className="text-sm text-navy-700">
                        {shortcut.description}
                      </span>
                      <kbd className="px-3 py-1.5 bg-silver-100 border border-silver-300 rounded text-xs font-mono font-semibold text-navy-700 shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Pro tip:</strong> Press{" "}
              <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">
                {modKey}+K
              </kbd>{" "}
              to open the command palette for quick access to all actions and
              navigation.
            </p>
          </div>
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}

/**
 * Keyboard Shortcut Hint Component
 * Displays keyboard shortcut next to buttons or actions
 *
 * @example
 * <Button>
 *   Save <KeyboardHint keys="Cmd+S" />
 * </Button>
 */
export function KeyboardHint({
  keys,
  className = "",
}: {
  keys: string;
  className?: string;
}) {
  return (
    <kbd
      className={`ml-2 px-2 py-0.5 bg-silver-100 border border-silver-300 rounded text-xs font-mono text-silver-600 ${className}`}
    >
      {keys}
    </kbd>
  );
}
