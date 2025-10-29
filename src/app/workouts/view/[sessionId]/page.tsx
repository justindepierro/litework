"use client";

import { useParams } from "next/navigation";
import WorkoutView from "@/components/WorkoutView";

export default function WorkoutViewPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <WorkoutView sessionId={sessionId} />;
}