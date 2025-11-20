import React from "react";
import { Display, Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { tokens } from "@/styles/tokens";

export default function DesignSystemPage() {
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
            <Heading level="h3">Accent Palette (Auto-Generated)</Heading>
            <Body variant="secondary" className="mb-4">
              Dynamically generated from <code>tokens.ts</code>.
            </Body>

            <div className="space-y-8">
              {Object.entries(tokens.color.accent).map(
                ([colorName, shades]) => (
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
                )
              )}
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
      </div>
    </div>
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
