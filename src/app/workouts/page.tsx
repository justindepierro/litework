import { redirect } from "next/navigation";
import WorkoutsClientPage from "./WorkoutsClientPage";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import {
  getAllWorkoutPlans,
  getAllGroups,
  getAllUsers,
} from "@/lib/database-service";
import type { AthleteGroup, User, WorkoutPlan } from "@/types";

async function getInitialWorkouts(
  userId: string,
  role: User["role"]
): Promise<WorkoutPlan[]> {
  const workouts = await getAllWorkoutPlans();
  if (role === "admin") {
    return workouts;
  }
  return workouts.filter((workout) => workout.createdBy === userId);
}

async function getInitialGroups(
  userId: string,
  isAdmin: boolean
): Promise<AthleteGroup[]> {
  const groups = await getAllGroups();
  if (isAdmin) {
    return groups;
  }
  return groups.filter((group) => group.coachId === userId);
}

async function getInitialAthletes(
  userId: string,
  isAdmin: boolean
): Promise<User[]> {
  const users = await getAllUsers();
  return users.filter((person) => {
    if (person.role !== "athlete") {
      return false;
    }

    if (isAdmin) {
      return true;
    }

    return person.coachId === userId;
  });
}

export default async function WorkoutsPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!isCoach(user)) {
    redirect("/dashboard");
  }

  const isAdmin = user.role === "admin";

  const [workouts, groups, athletes] = await Promise.all([
    getInitialWorkouts(user.id, user.role),
    getInitialGroups(user.id, isAdmin),
    getInitialAthletes(user.id, isAdmin),
  ]);

  return (
    <WorkoutsClientPage
      initialWorkouts={workouts}
      initialGroups={groups}
      initialAthletes={athletes}
    />
  );
}
