"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Body } from "@/components/ui/Typography";
import { Activity } from "lucide-react";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-(--bg-primary) px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="LiteWork Test Page"
          subtitle="Use this route to confirm the server and routing stack are online."
          icon={<Activity className="w-6 h-6" />}
          mobileAlign="left"
        />

        <div className="rounded-lg bg-white p-6 shadow">
          <Body>
            If you can see this, the server is working! Feel free to add quick
            diagnostics or temporary experiments here while keeping styling
            aligned with the design system.
          </Body>
        </div>
      </div>
    </div>
  );
}
