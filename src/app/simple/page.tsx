"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Body, Heading } from "@/components/ui/Typography";
import { Sparkles } from "lucide-react";

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-(--bg-primary) px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Simple Test"
          subtitle="Minimal Next.js page wired to LiteWork design tokens."
          icon={<Sparkles className="w-6 h-6" />}
          mobileAlign="left"
        />

        <div className="rounded-lg bg-white p-6 shadow">
          <Heading level="h4" className="mb-2">
            Hello from LiteWork!
          </Heading>
          <Body variant="secondary">
            This is a simple test page without any complex dependencies. Use it
            to verify rendering, routing, or hosting behavior without touching
            production data.
          </Body>
        </div>
      </div>
    </div>
  );
}
