"use client";

import React, { useState } from "react";
import { Display, Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { SnackbarProvider, useSnackbar } from "@/components/ui/Snackbar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { tokens } from "@/styles/tokens";
import {
  Edit,
  Trash,
  Save,
  Download,
  Dumbbell,
  Heart,
  Zap,
  Target,
} from "lucide-react";

function DesignSystemContent() {
  const snackbar = useSnackbar();
  const [progress, setProgress] = useState(45);
  const [selectedFilters, setSelectedFilters] = useState([
    "strength",
    "cardio",
  ]);

  const handleSnackbarDemo = (
    type: "success" | "error" | "warning" | "info"
  ) => {
    const messages = {
      success: "Workout saved successfully!",
      error: "Failed to load workout data",
      warning: "Session will expire in 5 minutes",
      info: "New exercises available in library",
    };

    if (type === "error") {
      snackbar.error(messages[type], {
        label: "RETRY",
        onClick: () => snackbar.info("Retrying..."),
      });
    } else {
      snackbar[type](messages[type]);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-primary border-b border-border-subtle">
        <div className="container-responsive py-12">
          <div className="max-w-3xl">
            <Badge variant="primary" className="mb-4">
              Design System v2.0
            </Badge>
            <Display size="lg" className="mb-4">
              LiteWork Design System
            </Display>
            <Body size="lg" variant="secondary">
              The single source of truth for our visual language. Built with
              OKLCH colors, fluid typography, and physics-based motion.
            </Body>
          </div>
        </div>
      </div>

      <div className="container-responsive py-12 space-y-20">
        {/* 1. Colors */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Colors</Heading>
            <Body variant="secondary">
              Wide gamut (OKLCH) color palette for modern displays.
            </Body>
          </div>

          {/* Brand Colors */}
          <div className="space-y-4">
            <Heading level="h3">Brand Colors</Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Brand (Orange)"
                token="bg-brand"
                text="text-white"
                value="var(--color-accent-orange)"
              />
              <ColorSwatch
                name="Brand Light"
                token="bg-brand-light"
                text="text-brand-dark"
                value="var(--color-accent-orange-100)"
              />
              <ColorSwatch
                name="Brand Dark"
                token="bg-brand-dark"
                text="text-white"
                value="var(--color-accent-orange-700)"
              />
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-4">
            <Heading level="h3">Semantic Colors</Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Success"
                token="bg-success"
                text="text-white"
                value="var(--color-success)"
              />
              <ColorSwatch
                name="Warning"
                token="bg-warning"
                text="text-white"
                value="var(--color-warning)"
              />
              <ColorSwatch
                name="Error"
                token="bg-error"
                text="text-white"
                value="var(--color-error)"
              />
              <ColorSwatch
                name="Info"
                token="bg-info"
                text="text-white"
                value="var(--color-info)"
              />
            </div>
          </div>

          {/* Accent Palette */}
          <div className="space-y-8">
            <Heading level="h3">Accent Palette</Heading>
            <Body variant="secondary" className="mb-4">
              Core colors for the app. Amber and lime are utility colors for
              warnings/alerts.
            </Body>

            <div className="space-y-8">
              {Object.entries(tokens.color.accent)
                .filter(
                  ([colorName]) =>
                    !["yellow", "lime", "amber"].includes(colorName)
                )
                .map(([colorName, shades]) => (
                  <div key={colorName} className="space-y-3">
                    <Heading
                      level="h4"
                      className="capitalize text-sm font-medium text-text-secondary"
                    >
                      {colorName}
                    </Heading>
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
                      {Object.entries(shades as Record<string, string>)
                        .filter(([key]) => key !== "DEFAULT")
                        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                        .map(([shade, value]) => (
                          <div
                            key={shade}
                            className="rounded-lg overflow-hidden border border-border-subtle"
                          >
                            <div
                              className="h-12 w-full"
                              style={{ background: value }}
                              title={`accent-${colorName}-${shade}`}
                            />
                            <div className="p-1.5 bg-bg-surface text-center">
                              <div className="text-[10px] font-mono text-text-tertiary">
                                {shade}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* 2. Typography */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Typography</Heading>
            <Body variant="secondary">
              Fluid typography scale that adapts to viewport size.
            </Body>
          </div>

          <div className="space-y-8 p-8 bg-bg-surface rounded-2xl border border-border-subtle">
            <div>
              <Display size="lg">Display Large</Display>
              <Caption>Font: Poppins / Weight: Bold / Fluid Size</Caption>
            </div>
            <div>
              <Display size="md">Display Medium</Display>
              <Caption>Font: Poppins / Weight: Bold / Fluid Size</Caption>
            </div>
            <div>
              <Heading level="h1">Heading XL</Heading>
              <Caption>Font: Poppins / Weight: Bold / Fluid Size</Caption>
            </div>
            <div>
              <Heading level="h2">Heading Large</Heading>
              <Caption>Font: Poppins / Weight: Bold / Fluid Size</Caption>
            </div>
            <div>
              <Heading level="h3">Heading Medium</Heading>
              <Caption>Font: Poppins / Weight: Semibold / Fluid Size</Caption>
            </div>
            <div>
              <Body size="lg">
                Body Large - The quick brown fox jumps over the lazy dog.
              </Body>
              <Caption>Font: Inter / Weight: Normal / 1.125rem</Caption>
            </div>
            <div>
              <Body size="base">
                Body Medium - The quick brown fox jumps over the lazy dog.
              </Body>
              <Caption>Font: Inter / Weight: Normal / 1rem</Caption>
            </div>
          </div>
        </section>

        {/* 3. Glass Materials */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Glass Materials</Heading>
            <Body variant="secondary">
              Backdrop filters and transparency tokens.
            </Body>
          </div>

          <div className="relative h-96 rounded-3xl overflow-hidden p-8 flex flex-col justify-center items-center gap-8">
            {/* Background for glass effect */}
            <div className="absolute inset-0 bg-linear-to-br from-accent-orange via-accent-purple to-accent-blue opacity-80" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl relative z-10">
              <div className="glass-thin p-8 rounded-2xl flex flex-col items-center text-center">
                <Heading level="h3" className="text-white mb-2">
                  Glass Thin
                </Heading>
                <Body className="text-white/80">
                  Low blur, high transparency.
                  <br />
                  <code>.glass-thin</code>
                </Body>
              </div>

              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center">
                <Heading level="h3" className="text-white mb-2">
                  Glass Regular
                </Heading>
                <Body className="text-white/80">
                  Medium blur, balanced opacity.
                  <br />
                  <code>.glass</code>
                </Body>
              </div>

              <div className="glass-thick p-8 rounded-2xl flex flex-col items-center text-center">
                <Heading level="h3" className="text-white mb-2">
                  Glass Thick
                </Heading>
                <Body className="text-white/80">
                  High blur, higher opacity.
                  <br />
                  <code>.glass-thick</code>
                </Body>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Fluid Spacing */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Fluid Spacing</Heading>
            <Body variant="secondary">
              Spacing that scales with the viewport. Resize window to test.
            </Body>
          </div>

          <div className="space-y-4">
            <SpacingBar name="fluid-xs" token="w-fluid-xs" />
            <SpacingBar name="fluid-sm" token="w-fluid-sm" />
            <SpacingBar name="fluid-md" token="w-fluid-md" />
            <SpacingBar name="fluid-lg" token="w-fluid-lg" />
            <SpacingBar name="fluid-xl" token="w-fluid-xl" />
            <SpacingBar name="fluid-2xl" token="w-fluid-2xl" />
            <SpacingBar name="fluid-3xl" token="w-fluid-3xl" />
          </div>
        </section>

        {/* 5. Motion */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Physics Motion</Heading>
            <Body variant="secondary">
              Spring-based animations for natural feel.
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle flex flex-col items-center gap-4">
              <Heading level="h4">Spring Bouncy</Heading>
              <div className="group">
                <div className="w-16 h-16 bg-brand rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-hover:scale-125 group-hover:rotate-12 cursor-pointer shadow-lg" />
              </div>
              <Caption>Hover me!</Caption>
            </div>

            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle flex flex-col items-center gap-4">
              <Heading level="h4">Spring Tight</Heading>
              <div className="group">
                <div className="w-16 h-16 bg-accent-purple rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-90 cursor-pointer shadow-lg" />
              </div>
              <Caption>Hover me!</Caption>
            </div>
          </div>
        </section>

        {/* 6. New Components Showcase */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Interactive Components</Heading>
            <Body variant="secondary">
              New enhanced components for better UX.
            </Body>
          </div>

          {/* Tooltips */}
          <div className="space-y-4">
            <Heading level="h3">Tooltips</Heading>
            <Body variant="secondary" className="mb-4">
              Hover over icons for contextual help. Configurable position and
              delay.
            </Body>
            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle">
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Edit workout" position="top">
                  <Button variant="secondary" size="md">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Save changes" position="bottom">
                  <Button variant="primary" size="md">
                    <Save className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip
                  content="Delete workout (This action cannot be undone)"
                  position="left"
                >
                  <Button variant="danger" size="md">
                    <Trash className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Download as PDF" position="right">
                  <Button variant="secondary" size="md">
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Snackbar */}
          <div className="space-y-4">
            <Heading level="h3">Snackbar Notifications</Heading>
            <Body variant="secondary" className="mb-4">
              Lightweight, bottom-anchored notifications with optional actions.
              Better than heavy toast libraries!
            </Body>
            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleSnackbarDemo("success")}
                >
                  Success Message
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleSnackbarDemo("error")}
                >
                  Error with Action
                </Button>
                <Button
                  variant="warning"
                  onClick={() => handleSnackbarDemo("warning")}
                >
                  Warning
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSnackbarDemo("info")}
                >
                  Info
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <Heading level="h3">Progress Bars</Heading>
            <Body variant="secondary" className="mb-4">
              Smooth animated progress indicators with multiple variants.
            </Body>
            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle space-y-6">
              <div className="space-y-2">
                <ProgressBar
                  value={progress}
                  variant="default"
                  size="md"
                  showLabel
                  label="Workout Progress"
                />
              </div>

              <div className="space-y-2">
                <ProgressBar
                  value={85}
                  variant="success"
                  size="md"
                  showLabel
                  label="Goals Completed"
                />
              </div>

              <div className="space-y-2">
                <ProgressBar
                  value={60}
                  variant="warning"
                  size="lg"
                  showLabel
                  label="Recovery Status"
                />
              </div>

              <div className="space-y-2">
                <ProgressBar
                  value={75}
                  variant="gradient"
                  size="lg"
                  showLabel
                  label="Training Intensity"
                />
              </div>

              <div className="space-y-2">
                <Caption variant="muted">Indeterminate loading state:</Caption>
                <ProgressBar
                  value={0}
                  variant="default"
                  size="sm"
                  indeterminate
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProgress(45)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Chips */}
          <div className="space-y-4">
            <Heading level="h3">Chips</Heading>
            <Body variant="secondary" className="mb-4">
              Compact elements for tags, filters, and labels. Perfect for
              categorization!
            </Body>
            <div className="p-8 bg-bg-surface rounded-2xl border border-border-subtle space-y-8">
              {/* Filter Chips */}
              <div className="space-y-3">
                <Caption variant="muted">Interactive Filter Chips:</Caption>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label="Strength"
                    variant="outlined"
                    selected={selectedFilters.includes("strength")}
                    onClick={() => toggleFilter("strength")}
                    icon={<Dumbbell className="w-4 h-4" />}
                  />
                  <Chip
                    label="Cardio"
                    variant="outlined"
                    selected={selectedFilters.includes("cardio")}
                    onClick={() => toggleFilter("cardio")}
                    icon={<Heart className="w-4 h-4" />}
                  />
                  <Chip
                    label="HIIT"
                    variant="outlined"
                    selected={selectedFilters.includes("hiit")}
                    onClick={() => toggleFilter("hiit")}
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <Chip
                    label="Mobility"
                    variant="outlined"
                    selected={selectedFilters.includes("mobility")}
                    onClick={() => toggleFilter("mobility")}
                    icon={<Target className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Status Chips */}
              <div className="space-y-3">
                <Caption variant="muted">Status Chips:</Caption>
                <div className="flex flex-wrap gap-2">
                  <Chip label="Active" variant="success" size="sm" />
                  <Chip label="Pending" variant="warning" size="sm" />
                  <Chip label="Failed" variant="error" size="sm" />
                  <Chip label="Completed" variant="primary" size="sm" />
                </div>
              </div>

              {/* Deletable Chips */}
              <div className="space-y-3">
                <Caption variant="muted">
                  Deletable Tags (click X to remove):
                </Caption>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label="Bench Press"
                    variant="default"
                    onDelete={() => snackbar.info("Removed: Bench Press")}
                  />
                  <Chip
                    label="Squats"
                    variant="default"
                    onDelete={() => snackbar.info("Removed: Squats")}
                  />
                  <Chip
                    label="Deadlifts"
                    variant="default"
                    onDelete={() => snackbar.info("Removed: Deadlifts")}
                  />
                </div>
              </div>

              {/* Size Variants */}
              <div className="space-y-3">
                <Caption variant="muted">Size Variants:</Caption>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip label="Small" variant="primary" size="sm" />
                  <Chip label="Medium" variant="primary" size="md" />
                  <Chip label="Large" variant="primary" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient Preview */}
        <section className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <Heading level="h2">Background Gradients</Heading>
            <Body variant="secondary">
              Smooth, subtle mesh gradients that add depth without distraction.
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-gradient-primary border border-border-subtle p-6 flex items-end">
              <div>
                <Heading level="h4" className="mb-1">
                  Primary Gradient
                </Heading>
                <Caption variant="muted">Soft multi-color blend</Caption>
              </div>
            </div>

            <div className="h-64 rounded-2xl bg-gradient-secondary border border-border-subtle p-6 flex items-end">
              <div>
                <Heading level="h4" className="mb-1">
                  Secondary Gradient
                </Heading>
                <Caption variant="muted">Warm, gentle transition</Caption>
              </div>
            </div>
          </div>

          <div
            className="p-8 rounded-2xl border border-border-subtle"
            style={{ background: "var(--page-gradient-energetic)" }}
          >
            <Heading level="h4" className="mb-2">
              Energetic Mesh Gradient
            </Heading>
            <Body variant="secondary">
              This is the default body background - a sophisticated mesh
              gradient with multiple radial overlays. Smoothed opacity
              (0.03-0.05) creates subtle depth without harsh glows.
            </Body>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <SnackbarProvider>
      <DesignSystemContent />
    </SnackbarProvider>
  );
}

function ColorSwatch({
  name,
  token,
  text,
  value,
}: {
  name: string;
  token: string;
  text: string;
  value: string;
}) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border-subtle`}>
      <div className={`h-24 ${token} flex items-end p-3`}>
        <span className={`font-medium ${text}`}>{name}</span>
      </div>
      <div className="p-3 bg-bg-surface">
        <div className="text-xs font-mono text-text-tertiary">{token}</div>
        <div className="text-xs text-text-secondary mt-1">{value}</div>
      </div>
    </div>
  );
}

function SpacingBar({ name, token }: { name: string; token: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-mono text-text-secondary">{name}</div>
      <div className={`h-8 bg-brand rounded ${token}`} />
      <div className="text-xs text-text-tertiary">Scales with viewport</div>
    </div>
  );
}
