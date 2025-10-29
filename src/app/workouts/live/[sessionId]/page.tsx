"use client";

import { useParams } from "next/navigation";
import WorkoutLive from "@/components/WorkoutLive";

export default function WorkoutLivePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <WorkoutLive sessionId={sessionId} />;
}