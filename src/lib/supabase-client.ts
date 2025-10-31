// Supabase API client for database operations
import { supabase } from "./supabase";
import type { User, AthleteGroup, WorkoutPlan, AthleteKPI } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SupabaseApiClient {
  // Authentication
  async signUp(
    email: string,
    password: string,
    userData: { name: string; role: "coach" | "athlete" }
  ) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          name: userData.name,
          role: userData.role,
        });

        if (profileError) {
          return { success: false, error: profileError.message };
        }
      }

      return { success: true, data: authData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        data: {
          user: profile,
          session: data.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: profile };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Athletes/Users
  async getAthletes(): Promise<ApiResponse<User[]>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          athlete_kpis(*)
        `
        )
        .eq("role", "athlete")
        .order("name");

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform data to match frontend types
      const athletes = data.map((user) => ({
        ...user,
        groupIds: user.group_ids || [],
        personalRecords: user.athlete_kpis || [],
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      })) as User[];

      return { success: true, data: athletes };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createAthlete(athleteData: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.signUp(athleteData.email, athleteData.password, {
      name: athleteData.name,
      role: "athlete",
    });
  }

  // Groups
  async getGroups(): Promise<ApiResponse<AthleteGroup[]>> {
    try {
      const { data, error } = await supabase
        .from("athlete_groups")
        .select("*")
        .order("name");

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform data to match frontend types
      const groups = data.map((group) => ({
        ...group,
        athleteIds: group.athlete_ids || [],
        coachId: group.coach_id,
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at),
      })) as AthleteGroup[];

      return { success: true, data: groups };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createGroup(
    groupData: Partial<AthleteGroup>
  ): Promise<ApiResponse<AthleteGroup>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const { data, error } = await supabase
        .from("athlete_groups")
        .insert({
          name: groupData.name,
          description: groupData.description,
          sport: groupData.sport,
          category: groupData.category,
          coach_id: user.id,
          athlete_ids: groupData.athleteIds || [],
          color: groupData.color,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform response
      const group = {
        ...data,
        athleteIds: data.athlete_ids || [],
        coachId: data.coach_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as AthleteGroup;

      return { success: true, data: group };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateGroup(
    groupId: string,
    groupData: Partial<AthleteGroup>
  ): Promise<ApiResponse<AthleteGroup>> {
    try {
      const { data, error } = await supabase
        .from("athlete_groups")
        .update({
          name: groupData.name,
          description: groupData.description,
          sport: groupData.sport,
          category: groupData.category,
          athlete_ids: groupData.athleteIds,
          color: groupData.color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform response
      const group = {
        ...data,
        athleteIds: data.athlete_ids || [],
        coachId: data.coach_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as AthleteGroup;

      return { success: true, data: group };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Workouts
  async getWorkouts(): Promise<ApiResponse<WorkoutPlan[]>> {
    try {
      const { data, error } = await supabase
        .from("workout_plans")
        .select(
          `
          *,
          workout_exercises(*)
        `
        )
        .order("name");

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform data to match frontend types
      const workouts = data.map((workout) => ({
        ...workout,
        exercises:
          workout.workout_exercises?.map((ex: Record<string, unknown>) => ({
            ...ex,
            exerciseId: ex.exercise_id,
            exerciseName: ex.exercise_name,
            weightType: ex.weight_type,
            restTime: ex.rest_time,
            order: ex.order_index,
            groupId: ex.group_id,
          })) || [],
        estimatedDuration: workout.estimated_duration,
        targetGroupId: workout.target_group_id,
        createdBy: workout.created_by,
        createdAt: new Date(workout.created_at),
        updatedAt: new Date(workout.updated_at),
      })) as WorkoutPlan[];

      return { success: true, data: workouts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createWorkout(
    workoutData: Partial<WorkoutPlan>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      // Create workout plan
      const { data: workoutPlan, error: workoutError } = await supabase
        .from("workout_plans")
        .insert({
          name: workoutData.name,
          description: workoutData.description,
          estimated_duration: workoutData.estimatedDuration,
          target_group_id: workoutData.targetGroupId,
          created_by: user.id,
        })
        .select()
        .single();

      if (workoutError) {
        return { success: false, error: workoutError.message };
      }

      // Create exercises if provided
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        const exercisesData = workoutData.exercises.map((exercise, index) => ({
          workout_plan_id: workoutPlan.id,
          exercise_id: exercise.exerciseId,
          exercise_name: exercise.exerciseName,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_type: exercise.weightType,
          weight: exercise.weight,
          percentage: exercise.percentage,
          rest_time: exercise.restTime,
          order_index: index,
          group_id: exercise.groupId,
        }));

        const { error: exerciseError } = await supabase
          .from("workout_exercises")
          .insert(exercisesData);

        if (exerciseError) {
          return { success: false, error: exerciseError.message };
        }
      }

      return { success: true, data: workoutPlan };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // KPIs
  async createKPI(
    kpiData: Partial<AthleteKPI>
  ): Promise<ApiResponse<AthleteKPI>> {
    try {
      const { data, error } = await supabase
        .from("athlete_kpis")
        .insert({
          athlete_id: kpiData.athleteId,
          exercise_id: kpiData.exerciseId,
          exercise_name: kpiData.exerciseName,
          current_pr: kpiData.currentPR,
          date_achieved: kpiData.dateAchieved,
          notes: kpiData.notes,
          is_active: kpiData.isActive !== false,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform response
      const kpi = {
        ...data,
        athleteId: data.athlete_id,
        exerciseId: data.exercise_id,
        exerciseName: data.exercise_name,
        currentPR: data.current_pr,
        dateAchieved: new Date(data.date_achieved),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as AthleteKPI;

      return { success: true, data: kpi };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateKPI(
    kpiId: string,
    kpiData: Partial<AthleteKPI>
  ): Promise<ApiResponse<AthleteKPI>> {
    try {
      const updateData: Record<string, unknown> = {};

      if (kpiData.exerciseName) updateData.exercise_name = kpiData.exerciseName;
      if (kpiData.currentPR !== undefined)
        updateData.current_pr = kpiData.currentPR;
      if (kpiData.dateAchieved) updateData.date_achieved = kpiData.dateAchieved;
      if (kpiData.notes) updateData.notes = kpiData.notes;
      if (kpiData.isActive !== undefined)
        updateData.is_active = kpiData.isActive;

      const { data, error } = await supabase
        .from("athlete_kpis")
        .update(updateData)
        .eq("id", kpiId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform response
      const kpi = {
        ...data,
        athleteId: data.athlete_id,
        exerciseId: data.exercise_id,
        exerciseName: data.exercise_name,
        currentPR: data.current_pr,
        dateAchieved: new Date(data.date_achieved),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as AthleteKPI;

      return { success: true, data: kpi };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async deleteKPI(kpiId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from("athlete_kpis")
        .delete()
        .eq("id", kpiId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Athlete Invites
  async createAthleteInvite(inviteData: {
    email: string;
    name: string;
    groupIds?: string[];
  }): Promise<ApiResponse<{ inviteCode: string; inviteUrl: string }>> {
    try {
      // Generate a secure invite code
      const inviteCode =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Create invite record in database
      const { error } = await supabase.from("athlete_invites").insert({
        invite_code: inviteCode,
        email: inviteData.email,
        name: inviteData.name,
        group_ids: inviteData.groupIds || [],
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
        is_used: false,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate invite URL
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join?code=${inviteCode}`;

      return { success: true, data: { inviteCode, inviteUrl } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async validateInvite(inviteCode: string): Promise<
    ApiResponse<{
      email: string;
      name: string;
      groupIds: string[];
    }>
  > {
    try {
      const { data, error } = await supabase
        .from("athlete_invites")
        .select("*")
        .eq("invite_code", inviteCode)
        .eq("is_used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error) {
        return { success: false, error: "Invalid or expired invite code" };
      }

      return {
        success: true,
        data: {
          email: data.email,
          name: data.name,
          groupIds: data.group_ids || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid invite code",
      };
    }
  }

  async acceptInvite(
    inviteCode: string,
    password: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // First validate the invite
      const inviteResult = await this.validateInvite(inviteCode);
      if (!inviteResult.success || !inviteResult.data) {
        return { success: false, error: inviteResult.error };
      }

      const { email, name, groupIds } = inviteResult.data;

      // Create the athlete account
      const signUpResult = await this.signUp(email, password, {
        name,
        role: "athlete",
      });
      if (!signUpResult.success) {
        return { success: false, error: signUpResult.error };
      }

      // Mark invite as used
      await supabase
        .from("athlete_invites")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("invite_code", inviteCode);

      // Add to groups if specified
      if (groupIds.length > 0) {
        // Update user's group memberships
        await supabase
          .from("users")
          .update({ group_ids: groupIds })
          .eq("email", email);
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async deleteAthlete(athleteId: string): Promise<ApiResponse<boolean>> {
    try {
      // First, delete all related KPIs
      await supabase.from("athlete_kpis").delete().eq("athlete_id", athleteId);

      // Then delete the user
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", athleteId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Communication methods
  async getMessages(params: {
    conversationWith?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      let query = supabase
        .from("messages")
        .select(
          `
          *,
          sender:sender_id(id, name, email, role),
          recipient:recipient_id(id, name, email, role)
        `
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (params.conversationWith) {
        query = query.or(
          `sender_id.eq.${params.conversationWith},recipient_id.eq.${params.conversationWith}`
        );
      }

      if (params.limit && params.offset !== undefined) {
        query = query.range(params.offset, params.offset + params.limit - 1);
      }

      const { data: messages, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: messages || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendMessage(params: {
    recipient_id: string;
    subject?: string;
    message: string;
    priority?: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      // Verify recipient exists
      const { data: recipient, error: recipientError } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", params.recipient_id)
        .single();

      if (recipientError || !recipient) {
        return { success: false, error: "Invalid recipient" };
      }

      // Insert message
      const { data: newMessage, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: params.recipient_id,
          subject: params.subject,
          message: params.message,
          priority: params.priority || "normal",
        })
        .select(
          `
          *,
          sender:sender_id(id, name, email, role),
          recipient:recipient_id(id, name, email, role)
        `
        )
        .single();

      if (messageError) {
        return { success: false, error: messageError.message };
      }

      return { success: true, data: newMessage };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create singleton instance
export const supabaseApiClient = new SupabaseApiClient();
