Initialising login role...
Dumping schemas from remote database...



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'coach',
    'athlete'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."weight_type" AS ENUM (
    'fixed',
    'percentage',
    'bodyweight'
);


ALTER TYPE "public"."weight_type" OWNER TO "postgres";


CREATE TYPE "public"."workout_mode" AS ENUM (
    'view',
    'live'
);


ALTER TYPE "public"."workout_mode" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_assign_group_kpis"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_group_id TEXT;
  v_kpi_assignment RECORD;
  v_existing_id UUID;
BEGIN
  -- Only process if group_ids changed (added new groups) OR if status changed to active
  IF TG_OP = 'UPDATE' THEN
    -- Skip if group_ids didn't change AND status didn't change to active
    IF NEW.group_ids = OLD.group_ids AND NOT (OLD.status = 'invited' AND NEW.status = 'active') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- For each group the athlete is now in
  FOREACH v_group_id IN ARRAY NEW.group_ids
  LOOP
    -- Skip if athlete was already in this group (for UPDATE operations)
    -- But still process if they just changed from invited to active
    IF TG_OP = 'UPDATE' AND v_group_id = ANY(OLD.group_ids) AND NOT (OLD.status = 'invited' AND NEW.status = 'active') THEN
      CONTINUE;
    END IF;

    -- Find all KPI assignments for this group
    FOR v_kpi_assignment IN
      SELECT DISTINCT
        kpi_tag_id,
        assigned_by,
        target_value,
        target_date,
        notes
      FROM athlete_assigned_kpis
      WHERE assigned_via = 'group:' || v_group_id
        AND is_active = true
    LOOP
      -- Check if athlete already has this KPI assigned
      SELECT id INTO v_existing_id
      FROM athlete_assigned_kpis
      WHERE athlete_id = NEW.id
        AND kpi_tag_id = v_kpi_assignment.kpi_tag_id
        AND is_active = true;

      -- Only assign if not already assigned
      IF v_existing_id IS NULL THEN
        INSERT INTO athlete_assigned_kpis (
          athlete_id,
          kpi_tag_id,
          assigned_by,
          assigned_via,
          target_value,
          target_date,
          notes,
          is_active
        ) VALUES (
          NEW.id,
          v_kpi_assignment.kpi_tag_id,
          v_kpi_assignment.assigned_by,
          'group:' || v_group_id, -- Preserve group assignment context
          v_kpi_assignment.target_value,
          v_kpi_assignment.target_date,
          v_kpi_assignment.notes,
          true
        );
      END IF;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_assign_group_kpis"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_assign_group_kpis"() IS 'Automatically assigns group KPIs to athletes when they join a group';



CREATE OR REPLACE FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text" DEFAULT 'individual'::"text", "p_target_value" numeric DEFAULT NULL::numeric, "p_target_date" "date" DEFAULT NULL::"date", "p_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("athlete_id" "uuid", "kpi_tag_id" "uuid", "assignment_id" "uuid", "was_already_assigned" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_athlete_id UUID;
  v_kpi_tag_id UUID;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Loop through all athlete/KPI combinations
  FOREACH v_athlete_id IN ARRAY p_athlete_ids
  LOOP
    FOREACH v_kpi_tag_id IN ARRAY p_kpi_tag_ids
    LOOP
      -- Check if already assigned and active
      SELECT id INTO v_existing_id
      FROM athlete_assigned_kpis
      WHERE athlete_assigned_kpis.athlete_id = v_athlete_id
        AND athlete_assigned_kpis.kpi_tag_id = v_kpi_tag_id
        AND is_active = true;
      
      IF v_existing_id IS NOT NULL THEN
        -- Already assigned - return existing
        athlete_id := v_athlete_id;
        kpi_tag_id := v_kpi_tag_id;
        assignment_id := v_existing_id;
        was_already_assigned := true;
        RETURN NEXT;
      ELSE
        -- Create new assignment
        INSERT INTO athlete_assigned_kpis (
          athlete_id,
          kpi_tag_id,
          assigned_by,
          assigned_via,
          target_value,
          target_date,
          notes
        ) VALUES (
          v_athlete_id,
          v_kpi_tag_id,
          p_assigned_by,
          p_assigned_via,
          p_target_value,
          p_target_date,
          p_notes
        ) RETURNING id INTO v_new_id;
        
        athlete_id := v_athlete_id;
        kpi_tag_id := v_kpi_tag_id;
        assignment_id := v_new_id;
        was_already_assigned := false;
        RETURN NEXT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text", "p_target_value" numeric, "p_target_date" "date", "p_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text", "p_target_value" numeric, "p_target_date" "date", "p_notes" "text") IS 'Bulk assign KPI tags to multiple athletes, skipping duplicates';



CREATE OR REPLACE FUNCTION "public"."calculate_age"("birth_date" "date") RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$;


ALTER FUNCTION "public"."calculate_age"("birth_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_bmi"("height_in" numeric, "weight_lb" numeric) RETURNS numeric
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF height_in IS NULL OR weight_lb IS NULL OR height_in <= 0 OR weight_lb <= 0 THEN
    RETURN NULL;
  END IF;
  -- BMI = (weight in lbs / (height in inches)^2) * 703
  RETURN ROUND((weight_lb / (height_in * height_in)) * 703, 1);
END;
$$;


ALTER FUNCTION "public"."calculate_bmi"("height_in" numeric, "weight_lb" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_communication_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.communication_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_communication_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_notification_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_notification_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_in_app_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_body" "text" DEFAULT NULL::"text", "p_icon" "text" DEFAULT NULL::"text", "p_url" "text" DEFAULT NULL::"text", "p_priority" "text" DEFAULT 'normal'::"text", "p_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO in_app_notifications (
    user_id,
    type,
    title,
    body,
    icon,
    url,
    priority,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_icon,
    p_url,
    p_priority,
    p_data
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_in_app_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_body" "text", "p_icon" "text", "p_url" "text", "p_priority" "text", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_plan_id UUID;
  v_exercise JSONB;
  v_group JSONB;
  v_block_instance JSONB;
  v_exercise_id UUID;
  v_group_id UUID;
  v_block_instance_id UUID;
  v_temp_group_id TEXT;
  v_temp_block_id TEXT;
  v_kpi_tag TEXT;
  v_group_id_map JSONB := '{}'::JSONB;
  v_block_id_map JSONB := '{}'::JSONB;
BEGIN
  -- 1. Create the workout plan
  INSERT INTO workout_plans (
    name,
    description,
    estimated_duration,
    target_group_id,
    created_by,
    archived,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_description,
    p_estimated_duration,
    p_target_group_id,
    p_created_by,
    COALESCE(p_archived, false),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_plan_id;

  -- 2. Insert block instances first (they need to exist before groups can reference them)
  IF p_block_instances IS NOT NULL AND jsonb_array_length(p_block_instances) > 0 THEN
    FOR v_block_instance IN SELECT * FROM jsonb_array_elements(p_block_instances)
    LOOP
      v_temp_block_id := v_block_instance->>'id';
      
      INSERT INTO workout_block_instances (
        workout_plan_id,
        source_block_id,
        source_block_name,
        instance_name,
        notes,
        estimated_duration,
        modified_exercises,
        added_exercises,
        removed_exercises,
        modified_groups,
        added_groups,
        removed_groups,
        created_at,
        updated_at
      ) VALUES (
        v_plan_id,
        (v_block_instance->>'source_block_id')::UUID,
        v_block_instance->>'source_block_name',
        v_block_instance->>'instance_name',
        v_block_instance->>'notes',
        (v_block_instance->>'estimated_duration')::INTEGER,
        COALESCE(v_block_instance->'modified_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'added_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'removed_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'modified_groups', '[]'::jsonb),
        COALESCE(v_block_instance->'added_groups', '[]'::jsonb),
        COALESCE(v_block_instance->'removed_groups', '[]'::jsonb),
        NOW(),
        NOW()
      )
      RETURNING id INTO v_block_instance_id;
      
      -- Store mapping of temporary ID to real UUID
      IF v_temp_block_id IS NOT NULL THEN
        v_block_id_map := jsonb_set(v_block_id_map, ARRAY[v_temp_block_id], to_jsonb(v_block_instance_id::text));
      END IF;
    END LOOP;
  END IF;

  -- 3. Insert exercise groups if provided (create mapping for group IDs)
  IF p_groups IS NOT NULL AND jsonb_array_length(p_groups) > 0 THEN
    FOR v_group IN SELECT * FROM jsonb_array_elements(p_groups)
    LOOP
      v_temp_group_id := v_group->>'id';
      
      -- Map the block_instance_id if it's a temporary ID
      v_block_instance_id := NULL;
      IF v_group->>'block_instance_id' IS NOT NULL THEN
        IF v_block_id_map ? (v_group->>'block_instance_id') THEN
          v_block_instance_id := (v_block_id_map->>(v_group->>'block_instance_id'))::UUID;
        ELSE
          -- Try to cast as UUID (for already-existing block instances)
          BEGIN
            v_block_instance_id := (v_group->>'block_instance_id')::UUID;
          EXCEPTION WHEN OTHERS THEN
            v_block_instance_id := NULL;
          END;
        END IF;
      END IF;
      
      INSERT INTO workout_exercise_groups (
        workout_plan_id,
        name,
        type,
        description,
        order_index,
        rest_between_rounds,
        rest_between_exercises,
        rounds,
        notes,
        block_instance_id,
        created_at
      ) VALUES (
        v_plan_id,
        v_group->>'name',
        v_group->>'type',
        v_group->>'description',
        (v_group->>'order_index')::INTEGER,
        (v_group->>'rest_between_rounds')::INTEGER,
        (v_group->>'rest_between_exercises')::INTEGER,
        (v_group->>'rounds')::INTEGER,
        v_group->>'notes',
        v_block_instance_id,
        NOW()
      )
      RETURNING id INTO v_group_id;
      
      -- Store mapping of temporary ID to real UUID
      IF v_temp_group_id IS NOT NULL THEN
        v_group_id_map := jsonb_set(v_group_id_map, ARRAY[v_temp_group_id], to_jsonb(v_group_id::text));
      END IF;
    END LOOP;
  END IF;

  -- 4. Insert exercises (map group_id and block_instance_id using our mappings)
  IF p_exercises IS NOT NULL AND jsonb_array_length(p_exercises) > 0 THEN
    FOR v_exercise IN SELECT * FROM jsonb_array_elements(p_exercises)
    LOOP
      -- Map the group_id if it's a temporary ID
      v_group_id := NULL;
      IF v_exercise->>'group_id' IS NOT NULL THEN
        IF v_group_id_map ? (v_exercise->>'group_id') THEN
          v_group_id := (v_group_id_map->>(v_exercise->>'group_id'))::UUID;
        ELSE
          -- Try to cast as UUID (for already-existing groups)
          BEGIN
            v_group_id := (v_exercise->>'group_id')::UUID;
          EXCEPTION WHEN OTHERS THEN
            v_group_id := NULL;
          END;
        END IF;
      END IF;
      
      -- Map the block_instance_id if it's a temporary ID
      v_block_instance_id := NULL;
      IF v_exercise->>'block_instance_id' IS NOT NULL THEN
        IF v_block_id_map ? (v_exercise->>'block_instance_id') THEN
          v_block_instance_id := (v_block_id_map->>(v_exercise->>'block_instance_id'))::UUID;
        ELSE
          -- Try to cast as UUID (for already-existing block instances)
          BEGIN
            v_block_instance_id := (v_exercise->>'block_instance_id')::UUID;
          EXCEPTION WHEN OTHERS THEN
            v_block_instance_id := NULL;
          END;
        END IF;
      END IF;
      
      -- Insert exercise with mapped IDs
      INSERT INTO workout_exercises (
        workout_plan_id,
        exercise_id,
        exercise_name,
        sets,
        reps,
        weight_type,
        weight,
        weight_max,
        percentage,
        percentage_max,
        percentage_base_kpi,
        tempo,
        each_side,
        rest_time,
        notes,
        order_index,
        group_id,
        block_instance_id,
        substitution_reason,
        original_exercise,
        progression_notes,
        created_at
      ) VALUES (
        v_plan_id,
        v_exercise->>'exercise_id',
        v_exercise->>'exercise_name',
        (v_exercise->>'sets')::INTEGER,
        (v_exercise->>'reps')::INTEGER,
        (v_exercise->>'weight_type')::weight_type,
        (v_exercise->>'weight')::NUMERIC,
        (v_exercise->>'weight_max')::NUMERIC,
        (v_exercise->>'percentage')::INTEGER,
        (v_exercise->>'percentage_max')::INTEGER,
        v_exercise->>'percentage_base_kpi',
        v_exercise->>'tempo',
        COALESCE((v_exercise->>'each_side')::BOOLEAN, false),
        (v_exercise->>'rest_time')::INTEGER,
        v_exercise->>'notes',
        (v_exercise->>'order_index')::INTEGER,
        v_group_id::text,
        v_block_instance_id::text,
        v_exercise->>'substitution_reason',
        v_exercise->>'original_exercise',
        v_exercise->>'progression_notes',
        NOW()
      )
      RETURNING id INTO v_exercise_id;

      -- Insert KPI tags for this exercise if provided
      IF v_exercise->'kpi_tag_ids' IS NOT NULL AND jsonb_array_length(v_exercise->'kpi_tag_ids') > 0 THEN
        FOR v_kpi_tag IN SELECT * FROM jsonb_array_elements_text(v_exercise->'kpi_tag_ids')
        LOOP
          INSERT INTO exercise_kpi_tags (workout_exercise_id, kpi_tag_id)
          VALUES (v_exercise_id, v_kpi_tag::UUID);
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_plan_id;
END;
$$;


ALTER FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") IS 'Creates a workout plan with exercises, groups, and block instances in a single transaction. Handles mapping of temporary frontend IDs to database UUIDs.';



CREATE OR REPLACE FUNCTION "public"."delete_expired_notifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM in_app_notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."delete_expired_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_deletion_history"("p_table_name" "text", "p_record_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "record_id" "uuid", "action" "text", "record_data" "jsonb", "deleted_at" timestamp with time zone, "deleted_by" "uuid", "deleted_by_email" "text", "deleted_by_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.record_id,
    a.action,
    COALESCE(a.old_values, a.new_values) as record_data,
    a.performed_at as deleted_at,
    a.performed_by as deleted_by,
    u.email as deleted_by_email,
    u.first_name || ' ' || u.last_name as deleted_by_name
  FROM public.audit_trail a
  LEFT JOIN public.users u ON a.performed_by = u.id
  WHERE 
    a.table_name = p_table_name
    AND a.action IN ('delete', 'soft_delete')
    AND (p_record_id IS NULL OR a.record_id = p_record_id)
  ORDER BY a.performed_at DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_deletion_history"("p_table_name" "text", "p_record_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_exercises_with_details"("category_filter" "uuid" DEFAULT NULL::"uuid", "muscle_group_filter" "text" DEFAULT NULL::"text", "equipment_filter" "text" DEFAULT NULL::"text", "difficulty_filter" integer DEFAULT NULL::integer, "search_term" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "name" "text", "description" "text", "category_name" "text", "category_color" "text", "muscle_groups" "jsonb", "equipment_needed" "text"[], "difficulty_level" integer, "is_compound" boolean, "is_bodyweight" boolean, "instructions" "jsonb", "video_url" "text", "usage_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.description,
    ec.name as category_name,
    ec.color as category_color,
    COALESCE(
      json_agg(
        json_build_object(
          'name', mg.name,
          'involvement', emg.involvement_type
        )
      ) FILTER (WHERE mg.id IS NOT NULL),
      '[]'::json
    )::jsonb as muscle_groups,
    e.equipment_needed,
    e.difficulty_level,
    e.is_compound,
    e.is_bodyweight,
    e.instructions,
    e.video_url,
    COALESCE(ea.usage_count, 0) as usage_count
  FROM public.exercises e
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  LEFT JOIN public.exercise_muscle_groups emg ON e.id = emg.exercise_id
  LEFT JOIN public.muscle_groups mg ON emg.muscle_group_id = mg.id
  LEFT JOIN public.exercise_analytics ea ON e.id = ea.exercise_id
  WHERE 
    e.is_active = true
    AND (category_filter IS NULL OR e.category_id = category_filter)
    AND (difficulty_filter IS NULL OR e.difficulty_level = difficulty_filter)
    AND (equipment_filter IS NULL OR equipment_filter = ANY(e.equipment_needed))
    AND (muscle_group_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.exercise_muscle_groups emg2 
      JOIN public.muscle_groups mg2 ON emg2.muscle_group_id = mg2.id
      WHERE emg2.exercise_id = e.id AND mg2.name ILIKE '%' || muscle_group_filter || '%'
    ))
    AND (search_term IS NULL OR 
         e.name ILIKE '%' || search_term || '%' OR 
         e.description ILIKE '%' || search_term || '%' OR
         search_term = ANY(e.tags))
  GROUP BY e.id, ec.name, ec.color, ea.usage_count
  ORDER BY e.name;
END;
$$;


ALTER FUNCTION "public"."get_exercises_with_details"("category_filter" "uuid", "muscle_group_filter" "text", "equipment_filter" "text", "difficulty_filter" integer, "search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_message_count"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.messages 
    WHERE recipient_id = user_id AND is_read = FALSE
  );
END;
$$;


ALTER FUNCTION "public"."get_unread_message_count"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_notification_count"("target_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM in_app_notifications
    WHERE user_id = target_user_id
      AND read = false
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;


ALTER FUNCTION "public"."get_unread_notification_count"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_notification_preferences"("target_user_id" "uuid") RETURNS TABLE("push_enabled" boolean, "email_enabled" boolean, "workout_reminders" boolean, "assignment_notifications" boolean, "message_notifications" boolean, "progress_updates" boolean, "achievement_notifications" boolean, "quiet_hours" "jsonb", "preferred_contact" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.push_enabled,
    np.email_enabled,
    np.workout_reminders,
    np.assignment_notifications,
    np.message_notifications,
    np.progress_updates,
    np.achievement_notifications,
    np.quiet_hours,
    np.preferred_contact
  FROM notification_preferences np
  WHERE np.user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_notification_preferences"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
      NEW.email
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Automatically creates a user profile when a new auth user is created';



CREATE OR REPLACE FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  athlete_record RECORD;
  cleanup_summary JSONB;
  deleted_kpis INT;
  deleted_sessions INT;
  deleted_assignments INT;
  updated_groups INT;
BEGIN
  -- Verify confirmation code
  IF confirmation_code != athlete_id::TEXT THEN
    RAISE EXCEPTION 'Confirmation code mismatch. Hard delete cancelled.';
  END IF;
  
  -- Get athlete data before deletion
  SELECT * INTO athlete_record FROM users WHERE id = athlete_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found: %', athlete_id;
  END IF;
  
  -- CASCADE CLEANUP
  
  -- 1. Delete KPIs
  DELETE FROM athlete_kpis WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_kpis = ROW_COUNT;
  
  -- 2. Delete workout sessions
  DELETE FROM workout_sessions WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- 3. Delete workout assignments
  DELETE FROM workout_assignments WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_assignments = ROW_COUNT;
  
  -- 4. Remove from groups
  UPDATE athlete_groups
  SET athlete_ids = array_remove(athlete_ids, athlete_id)
  WHERE athlete_id = ANY(athlete_ids);
  GET DIAGNOSTICS updated_groups = ROW_COUNT;
  
  -- 5. Delete progress entries
  DELETE FROM progress_entries WHERE athlete_id = athlete_id;
  
  -- 6. Delete set records
  DELETE FROM set_records 
  WHERE session_id IN (
    SELECT id FROM workout_sessions WHERE athlete_id = athlete_id
  );
  
  -- 7. HARD DELETE the user
  DELETE FROM users WHERE id = athlete_id;
  
  -- 8. Delete from Supabase Auth (handled by application layer)
  
  -- Log the HARD deletion
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    record_data,
    performed_by,
    reason
  ) VALUES (
    'hard_delete',
    'users',
    athlete_id,
    to_jsonb(athlete_record),
    deleted_by,
    deletion_reason
  );
  
  -- Build summary
  cleanup_summary := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'athlete_name', athlete_record.first_name || ' ' || athlete_record.last_name,
    'deleted_kpis', deleted_kpis,
    'deleted_sessions', deleted_sessions,
    'deleted_assignments', deleted_assignments,
    'updated_groups', updated_groups,
    'warning', 'This action cannot be undone',
    'deleted_at', NOW()
  );
  
  RETURN cleanup_summary;
END;
$$;


ALTER FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") IS 'Permanently delete an athlete with CASCADE cleanup. Cannot be undone. Requires confirmation code.';



CREATE OR REPLACE FUNCTION "public"."increment_block_usage"("block_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE workout_blocks
  SET 
    usage_count = usage_count + 1,
    last_used = NOW(),
    updated_at = NOW()
  WHERE id = block_id;
END;
$$;


ALTER FUNCTION "public"."increment_block_usage"("block_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.exercise_analytics (exercise_id, usage_count, last_used_at)
  VALUES (exercise_uuid, 1, NOW())
  ON CONFLICT (exercise_id) 
  DO UPDATE SET 
    usage_count = exercise_analytics.usage_count + 1,
    last_used_at = NOW();
END;
$$;


ALTER FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_audit_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Log DELETE operations
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_trail (
      table_name,
      record_id,
      action,
      old_values,
      performed_by
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      CASE 
        WHEN OLD.deleted_at IS NOT NULL THEN 'delete' -- Already soft-deleted, now hard deleting
        ELSE 'delete'
      END,
      to_jsonb(OLD),
      auth.uid()
    );
    RETURN OLD;
  END IF;

  -- Log UPDATE operations (especially soft deletes and restores)
  IF (TG_OP = 'UPDATE') THEN
    -- Soft delete detection (deleted_at changed from NULL to timestamp)
    IF (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'soft_delete',
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
      RETURN NEW;
    END IF;

    -- Restore detection (deleted_at changed from timestamp to NULL)
    IF (OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'restore',
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
      RETURN NEW;
    END IF;

    -- Log other significant updates (status changes, etc.)
    IF (TG_TABLE_NAME = 'invites' AND OLD.status IS DISTINCT FROM NEW.status) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'update',
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status),
        auth.uid()
      );
    END IF;

    RETURN NEW;
  END IF;

  -- Log INSERT operations for invites
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'invites') THEN
    INSERT INTO public.audit_trail (
      table_name,
      record_id,
      action,
      new_values,
      performed_by
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_audit_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_message_as_read"("message_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.messages 
  SET is_read = TRUE, read_at = NOW() 
  WHERE id = message_id AND recipient_id = auth.uid();
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."mark_message_as_read"("message_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
BEGIN
  -- Restore the user
  UPDATE users 
  SET deleted_at = NULL
  WHERE id = athlete_id AND deleted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found or not deleted: %', athlete_id;
  END IF;
  
  -- Log the restoration
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    performed_by
  ) VALUES (
    'restore',
    'users',
    athlete_id,
    restored_by
  );
  
  result := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'restored_at', NOW()
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") IS 'Restore a soft-deleted athlete.';



CREATE OR REPLACE FUNCTION "public"."restore_deleted_invite"("invite_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
BEGIN
  -- Restore the invite by clearing deleted_at
  UPDATE public.invites
  SET 
    deleted_at = NULL,
    updated_at = NOW()
  WHERE id = invite_id
  RETURNING to_jsonb(invites.*) INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Invite not found: %', invite_id;
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."restore_deleted_invite"("invite_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_coach_responded_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.coach_response IS NOT NULL AND OLD.coach_response IS NULL THEN
    NEW.coach_responded_at = NOW();
    NEW.coach_viewed = TRUE;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_coach_responded_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  athlete_record RECORD;
  affected_groups INT;
  affected_assignments INT;
  result JSONB;
BEGIN
  -- Get athlete data before deletion
  SELECT * INTO athlete_record FROM users WHERE id = athlete_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found: %', athlete_id;
  END IF;
  
  -- Soft delete the user
  UPDATE users 
  SET deleted_at = NOW()
  WHERE id = athlete_id;
  
  -- Log the deletion
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    record_data,
    performed_by,
    reason
  ) VALUES (
    'delete',
    'users',
    athlete_id,
    to_jsonb(athlete_record),
    deleted_by,
    deletion_reason
  );
  
  -- Count affected relationships
  SELECT COUNT(*) INTO affected_groups
  FROM athlete_groups
  WHERE athlete_id = ANY(athlete_ids);
  
  SELECT COUNT(*) INTO affected_assignments
  FROM workout_assignments
  WHERE athlete_id = athlete_id;
  
  -- Return summary
  result := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'athlete_name', athlete_record.first_name || ' ' || athlete_record.last_name,
    'affected_groups', affected_groups,
    'affected_assignments', affected_assignments,
    'can_restore', true,
    'deleted_at', NOW()
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text") IS 'Soft delete an athlete with audit logging. Can be restored.';



CREATE OR REPLACE FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_favorite boolean;
BEGIN
  SELECT is_favorite INTO current_favorite
  FROM workout_blocks
  WHERE id = block_id AND created_by = user_id;
  
  IF current_favorite IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE workout_blocks
  SET 
    is_favorite = NOT current_favorite,
    updated_at = NOW()
  WHERE id = block_id AND created_by = user_id;
  
  RETURN NOT current_favorite;
END;
$$;


ALTER FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_athlete_assigned_kpis_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_athlete_assigned_kpis_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_feedback_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_feedback_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notification_preferences_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notification_preferences_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_last_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.users 
  SET last_activity_at = NOW() 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_last_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_workout_blocks_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_workout_blocks_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_workout_plan_transaction"("p_plan_id" "uuid", "p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_exercise JSONB;
  v_group JSONB;
  v_block_instance JSONB;
  v_exercise_id UUID;
  v_kpi_tag TEXT;
BEGIN
  -- 1. Update the workout plan
  UPDATE workout_plans
  SET
    name = p_name,
    description = p_description,
    estimated_duration = p_estimated_duration,
    target_group_id = p_target_group_id,
    archived = COALESCE(p_archived, false),
    updated_at = NOW()
  WHERE id = p_plan_id;

  -- 2. Delete existing data (cascading deletes will handle related records)
  -- Note: exercise_kpi_tags should have ON DELETE CASCADE foreign key
  DELETE FROM workout_exercises WHERE workout_plan_id = p_plan_id;
  DELETE FROM workout_exercise_groups WHERE workout_plan_id = p_plan_id;
  DELETE FROM workout_block_instances WHERE workout_plan_id = p_plan_id;

  -- 3. Insert exercise groups if provided
  IF p_groups IS NOT NULL AND jsonb_array_length(p_groups) > 0 THEN
    FOR v_group IN SELECT * FROM jsonb_array_elements(p_groups)
    LOOP
      INSERT INTO workout_exercise_groups (
        workout_plan_id,
        name,
        type,
        description,
        order_index,
        rest_between_rounds,
        rest_between_exercises,
        rounds,
        notes,
        block_instance_id,
        created_at
      ) VALUES (
        p_plan_id,
        v_group->>'name',
        v_group->>'type',
        v_group->>'description',
        (v_group->>'order_index')::INTEGER,
        (v_group->>'rest_between_rounds')::INTEGER,
        (v_group->>'rest_between_exercises')::INTEGER,
        (v_group->>'rounds')::INTEGER,
        v_group->>'notes',
        NULLIF(v_group->>'block_instance_id', '')::UUID,
        NOW()
      );
    END LOOP;
  END IF;

  -- 4. Insert exercises if provided
  IF p_exercises IS NOT NULL AND jsonb_array_length(p_exercises) > 0 THEN
    FOR v_exercise IN SELECT * FROM jsonb_array_elements(p_exercises)
    LOOP
      -- Insert exercise
      INSERT INTO workout_exercises (
        workout_plan_id,
        exercise_id,
        exercise_name,
        sets,
        reps,
        weight_type,
        weight,
        weight_max,
        percentage,
        percentage_max,
        percentage_base_kpi,
        tempo,
        each_side,
        rest_time,
        notes,
        video_url,
        order_index,
        group_id,
        block_instance_id,
        substitution_reason,
        original_exercise,
        progression_notes,
        created_at
      ) VALUES (
        p_plan_id,
        NULLIF(v_exercise->>'exercise_id', '')::UUID,
        v_exercise->>'exercise_name',
        (v_exercise->>'sets')::INTEGER,
        v_exercise->>'reps',
        v_exercise->>'weight_type',
        (v_exercise->>'weight')::NUMERIC,
        (v_exercise->>'weight_max')::NUMERIC,
        (v_exercise->>'percentage')::NUMERIC,
        (v_exercise->>'percentage_max')::NUMERIC,
        v_exercise->>'percentage_base_kpi',
        v_exercise->>'tempo',
        COALESCE((v_exercise->>'each_side')::BOOLEAN, false),
        (v_exercise->>'rest_time')::INTEGER,
        v_exercise->>'notes',
        v_exercise->>'video_url',
        (v_exercise->>'order_index')::INTEGER,
        NULLIF(v_exercise->>'group_id', '')::UUID,
        NULLIF(v_exercise->>'block_instance_id', '')::UUID,
        v_exercise->>'substitution_reason',
        v_exercise->>'original_exercise',
        v_exercise->>'progression_notes',
        NOW()
      )
      RETURNING id INTO v_exercise_id;

      -- Insert KPI tags for this exercise if provided
      IF v_exercise->'kpi_tag_ids' IS NOT NULL AND jsonb_array_length(v_exercise->'kpi_tag_ids') > 0 THEN
        FOR v_kpi_tag IN SELECT * FROM jsonb_array_elements_text(v_exercise->'kpi_tag_ids')
        LOOP
          INSERT INTO exercise_kpi_tags (workout_exercise_id, kpi_tag_id)
          VALUES (v_exercise_id, v_kpi_tag::UUID);
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  -- 5. Insert block instances if provided
  IF p_block_instances IS NOT NULL AND jsonb_array_length(p_block_instances) > 0 THEN
    FOR v_block_instance IN SELECT * FROM jsonb_array_elements(p_block_instances)
    LOOP
      INSERT INTO workout_block_instances (
        workout_plan_id,
        source_block_id,
        source_block_name,
        instance_name,
        notes,
        estimated_duration,
        modified_exercises,
        added_exercises,
        removed_exercises,
        modified_groups,
        added_groups,
        removed_groups,
        created_at,
        updated_at
      ) VALUES (
        p_plan_id,
        (v_block_instance->>'source_block_id')::UUID,
        v_block_instance->>'source_block_name',
        v_block_instance->>'instance_name',
        v_block_instance->>'notes',
        (v_block_instance->>'estimated_duration')::INTEGER,
        COALESCE(v_block_instance->'modified_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'added_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'removed_exercises', '[]'::jsonb),
        COALESCE(v_block_instance->'modified_groups', '[]'::jsonb),
        COALESCE(v_block_instance->'added_groups', '[]'::jsonb),
        COALESCE(v_block_instance->'removed_groups', '[]'::jsonb),
        NOW(),
        NOW()
      );
    END LOOP;
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Any error will cause the entire transaction to rollback
    RAISE;
END;
$$;


ALTER FUNCTION "public"."update_workout_plan_transaction"("p_plan_id" "uuid", "p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_workout_session_feedback_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_workout_session_feedback_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."athlete_assigned_kpis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "kpi_tag_id" "uuid" NOT NULL,
    "assigned_by" "uuid",
    "assigned_via" "text",
    "assigned_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "target_value" numeric,
    "target_date" "date",
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."athlete_assigned_kpis" OWNER TO "postgres";


COMMENT ON TABLE "public"."athlete_assigned_kpis" IS 'Links athletes to their active KPI tags for tracking performance metrics';



CREATE TABLE IF NOT EXISTS "public"."kpi_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "color" "text" DEFAULT '#3B82F6'::"text" NOT NULL,
    "description" "text",
    "kpi_type" "text" DEFAULT 'one_rm'::"text" NOT NULL,
    "primary_exercise_id" "text",
    "created_by" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kpi_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."kpi_tags" IS 'Available KPI tags for categorizing exercises (coach-defined)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'athlete'::"public"."user_role" NOT NULL,
    "group_ids" "text"[] DEFAULT '{}'::"text"[],
    "coach_id" "uuid",
    "date_of_birth" "date",
    "injury_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bio" "text",
    "profile_image_url" "text",
    "phone_number" "text",
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "last_activity_at" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "full_name" "text" GENERATED ALWAYS AS ((("first_name" || ' '::"text") || "last_name")) STORED,
    "avatar_url" "text",
    "height_inches" numeric(5,2),
    "weight_lbs" numeric(5,2),
    "gender" "text",
    "notification_preferences" "jsonb" DEFAULT '{"workoutReminders": {"timing": "smart", "enabled": true, "channels": ["email"]}, "assignmentNotifications": {"enabled": true, "channels": ["email"]}, "achievementNotifications": {"enabled": true, "channels": ["email"]}}'::"jsonb",
    "notes" "text",
    "deleted_at" timestamp with time zone,
    "tos_accepted_at" timestamp without time zone,
    "tos_version" "text" DEFAULT '1.0'::"text",
    "privacy_policy_accepted_at" timestamp without time zone,
    "privacy_policy_version" "text" DEFAULT '1.0'::"text",
    CONSTRAINT "users_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text", 'prefer_not_to_say'::"text"]))),
    CONSTRAINT "users_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'invited'::"text", 'inactive'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."bio" IS 'Athlete bio/description visible to athlete';



COMMENT ON COLUMN "public"."users"."notification_preferences" IS 'User notification preferences in JSONB format:
{
  "workoutReminders": {
    "enabled": boolean,
    "timing": "smart" | "morning" | "evening" | "2hours" | "1hour" | "30min",
    "channels": ["email", "push"]
  },
  "achievementNotifications": {
    "enabled": boolean,
    "channels": ["email", "push"]
  },
  "assignmentNotifications": {
    "enabled": boolean,
    "channels": ["email", "push"]
  }
}';



COMMENT ON COLUMN "public"."users"."notes" IS 'Coach notes about athlete (visible only to coaches)';



COMMENT ON COLUMN "public"."users"."deleted_at" IS 'Soft delete timestamp. NULL = active, NOT NULL = deleted';



COMMENT ON COLUMN "public"."users"."tos_accepted_at" IS 'Timestamp when user accepted Terms of Service';



COMMENT ON COLUMN "public"."users"."tos_version" IS 'Version of TOS that user accepted (e.g., 1.0, 1.1, 2.0)';



COMMENT ON COLUMN "public"."users"."privacy_policy_accepted_at" IS 'Timestamp when user accepted Privacy Policy';



COMMENT ON COLUMN "public"."users"."privacy_policy_version" IS 'Version of Privacy Policy that user accepted';



CREATE OR REPLACE VIEW "public"."active_athlete_kpis" AS
 SELECT "aak"."id" AS "assignment_id",
    "aak"."athlete_id",
    "u"."name" AS "athlete_name",
    "aak"."kpi_tag_id",
    "kt"."name" AS "kpi_name",
    "kt"."display_name" AS "kpi_display_name",
    "kt"."color" AS "kpi_color",
    "kt"."kpi_type",
    "aak"."target_value",
    "aak"."target_date",
    "aak"."notes",
    "aak"."assigned_via",
    "aak"."assigned_at",
    "assigned_by_user"."name" AS "assigned_by_name"
   FROM ((("public"."athlete_assigned_kpis" "aak"
     JOIN "public"."users" "u" ON (("aak"."athlete_id" = "u"."id")))
     JOIN "public"."kpi_tags" "kt" ON (("aak"."kpi_tag_id" = "kt"."id")))
     LEFT JOIN "public"."users" "assigned_by_user" ON (("aak"."assigned_by" = "assigned_by_user"."id")))
  WHERE ("aak"."is_active" = true)
  ORDER BY "u"."name", "kt"."display_name";


ALTER VIEW "public"."active_athlete_kpis" OWNER TO "postgres";


COMMENT ON VIEW "public"."active_athlete_kpis" IS 'Active athlete KPI assignments with full tag details';



CREATE OR REPLACE VIEW "public"."active_athletes" AS
 SELECT "id",
    "email",
    "name",
    "role",
    "group_ids",
    "coach_id",
    "date_of_birth",
    "injury_status",
    "created_at",
    "updated_at",
    "bio",
    "profile_image_url",
    "phone_number",
    "emergency_contact_name",
    "emergency_contact_phone",
    "last_activity_at",
    "status",
    "first_name",
    "last_name",
    "full_name",
    "avatar_url",
    "height_inches",
    "weight_lbs",
    "gender",
    "notification_preferences",
    "notes",
    "deleted_at"
   FROM "public"."users"
  WHERE (("role" = 'athlete'::"public"."user_role") AND ("deleted_at" IS NULL));


ALTER VIEW "public"."active_athletes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "activity_log_action_type_check" CHECK (("action_type" = ANY (ARRAY['workout_completed'::"text", 'pr_achieved'::"text", 'login'::"text", 'profile_updated'::"text", 'message_sent'::"text"])))
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."athlete_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "achievement_type" "text" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."athlete_achievements" OWNER TO "postgres";


COMMENT ON TABLE "public"."athlete_achievements" IS 'Tracks achievement badges earned by athletes';



COMMENT ON COLUMN "public"."athlete_achievements"."achievement_type" IS 'Type of achievement: first_workout, streak_3, volume_10k, etc.';



CREATE TABLE IF NOT EXISTS "public"."athlete_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" character varying(50) NOT NULL,
    "table_name" character varying(50) NOT NULL,
    "record_id" "uuid" NOT NULL,
    "record_data" "jsonb",
    "performed_by" "uuid",
    "performed_at" timestamp with time zone DEFAULT "now"(),
    "reason" "text",
    "ip_address" "inet",
    "user_agent" "text"
);


ALTER TABLE "public"."athlete_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."athlete_audit_log" IS 'Audit log for all athlete deletion/restoration actions';



CREATE TABLE IF NOT EXISTS "public"."workout_feedback" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "workout_session_id" "uuid" NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "difficulty_rating" integer,
    "difficulty_notes" "text",
    "soreness_level" integer,
    "soreness_areas" "text"[],
    "energy_level" integer,
    "enjoyed" boolean,
    "what_went_well" "text",
    "what_was_difficult" "text",
    "suggestions" "text",
    "coach_viewed" boolean DEFAULT false,
    "coach_response" "text",
    "coach_responded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workout_feedback_difficulty_rating_check" CHECK ((("difficulty_rating" >= 1) AND ("difficulty_rating" <= 10))),
    CONSTRAINT "workout_feedback_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "workout_feedback_soreness_level_check" CHECK ((("soreness_level" >= 1) AND ("soreness_level" <= 10)))
);


ALTER TABLE "public"."workout_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."workout_feedback" IS 'Athlete feedback on completed workouts';



COMMENT ON COLUMN "public"."workout_feedback"."difficulty_rating" IS 'How difficult was the workout (1=too easy, 10=way too hard)';



COMMENT ON COLUMN "public"."workout_feedback"."soreness_level" IS 'Overall soreness level (1=none, 10=extremely sore)';



COMMENT ON COLUMN "public"."workout_feedback"."soreness_areas" IS 'Array of muscle groups experiencing soreness';



COMMENT ON COLUMN "public"."workout_feedback"."energy_level" IS 'Energy level after workout (1=exhausted, 10=energized)';



COMMENT ON COLUMN "public"."workout_feedback"."enjoyed" IS 'Whether the athlete enjoyed the workout';



CREATE OR REPLACE VIEW "public"."athlete_feedback_summary" AS
 SELECT "athlete_id",
    "count"(*) AS "total_feedback",
    "avg"("difficulty_rating") AS "avg_difficulty",
    "avg"("soreness_level") AS "avg_soreness",
    "avg"("energy_level") AS "avg_energy",
    (("sum"(
        CASE
            WHEN ("enjoyed" = true) THEN 1
            ELSE 0
        END))::double precision / ("count"(*))::double precision) AS "enjoyment_rate",
    "sum"(
        CASE
            WHEN ("coach_viewed" = true) THEN 1
            ELSE 0
        END) AS "feedback_viewed",
    "max"("created_at") AS "last_feedback_date"
   FROM "public"."workout_feedback"
  GROUP BY "athlete_id";


ALTER VIEW "public"."athlete_feedback_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."athlete_feedback_summary" IS 'Aggregate feedback statistics by athlete';



CREATE TABLE IF NOT EXISTS "public"."athlete_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sport" "text" NOT NULL,
    "category" "text",
    "coach_id" "uuid" NOT NULL,
    "athlete_ids" "text"[] DEFAULT '{}'::"text"[],
    "color" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archived" boolean DEFAULT false
);


ALTER TABLE "public"."athlete_groups" OWNER TO "postgres";


COMMENT ON COLUMN "public"."athlete_groups"."archived" IS 'Whether the group is archived (soft delete)';



CREATE TABLE IF NOT EXISTS "public"."exercise_kpi_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_exercise_id" "uuid" NOT NULL,
    "kpi_tag_id" "uuid" NOT NULL,
    "relevance_notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exercise_kpi_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."exercise_kpi_tags" IS 'Links workout exercises to KPI tags for tracking training leading to PRs';



CREATE TABLE IF NOT EXISTS "public"."session_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_session_id" "uuid",
    "workout_exercise_id" "uuid" NOT NULL,
    "exercise_name" "text" NOT NULL,
    "target_sets" integer NOT NULL,
    "completed_sets" integer DEFAULT 0,
    "started" boolean DEFAULT false,
    "completed" boolean DEFAULT false,
    "is_modified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "group_id" "uuid"
);


ALTER TABLE "public"."session_exercises" OWNER TO "postgres";


COMMENT ON COLUMN "public"."session_exercises"."group_id" IS 'Reference to the exercise group this exercise belongs to (superset, circuit, or section)';



CREATE TABLE IF NOT EXISTS "public"."set_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_exercise_id" "uuid",
    "set_number" integer NOT NULL,
    "target_reps" integer NOT NULL,
    "actual_reps" integer NOT NULL,
    "target_weight" numeric NOT NULL,
    "actual_weight" numeric NOT NULL,
    "completed" boolean DEFAULT true,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."set_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_plan_id" "uuid" NOT NULL,
    "assigned_by" "uuid" NOT NULL,
    "assigned_to_user_id" "uuid",
    "assigned_to_group_id" "uuid",
    "scheduled_date" "date" NOT NULL,
    "notes" "text",
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "start_time" time without time zone,
    "end_time" time without time zone,
    "location" "text",
    "reminder_sent" boolean DEFAULT false,
    "notification_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "workout_plan_name" "text",
    "assignment_type" "text" DEFAULT 'individual'::"text",
    "athlete_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "assigned_date" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'assigned'::"text",
    "modifications" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "assignment_target_check" CHECK (((("assigned_to_user_id" IS NOT NULL) AND ("assigned_to_group_id" IS NULL)) OR (("assigned_to_user_id" IS NULL) AND ("assigned_to_group_id" IS NOT NULL)))),
    CONSTRAINT "workout_assignments_assignment_type_check" CHECK (("assignment_type" = ANY (ARRAY['individual'::"text", 'group'::"text"]))),
    CONSTRAINT "workout_assignments_status_check" CHECK (("status" = ANY (ARRAY['assigned'::"text", 'in_progress'::"text", 'completed'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."workout_assignments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workout_assignments"."start_time" IS 'Training session start time (HH:MM format)';



COMMENT ON COLUMN "public"."workout_assignments"."end_time" IS 'Training session end time (HH:MM format)';



COMMENT ON COLUMN "public"."workout_assignments"."location" IS 'Where the workout will take place';



COMMENT ON COLUMN "public"."workout_assignments"."reminder_sent" IS 'Whether reminder notification has been sent';



COMMENT ON COLUMN "public"."workout_assignments"."notification_preferences" IS 'JSON object with notification settings';



COMMENT ON COLUMN "public"."workout_assignments"."workout_plan_name" IS 'Cached workout plan name for display';



COMMENT ON COLUMN "public"."workout_assignments"."assignment_type" IS 'Type of assignment: individual or group';



COMMENT ON COLUMN "public"."workout_assignments"."athlete_ids" IS 'Array of athlete UUIDs assigned to this workout';



COMMENT ON COLUMN "public"."workout_assignments"."assigned_date" IS 'When the workout was assigned (different from scheduled_date)';



COMMENT ON COLUMN "public"."workout_assignments"."status" IS 'Current status: assigned, in_progress, completed, skipped';



COMMENT ON COLUMN "public"."workout_assignments"."modifications" IS 'Individual athlete modifications to the base workout';



CREATE TABLE IF NOT EXISTS "public"."workout_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_plan_id" "uuid",
    "exercise_id" "text" NOT NULL,
    "exercise_name" "text" NOT NULL,
    "sets" integer NOT NULL,
    "reps" integer NOT NULL,
    "weight_type" "public"."weight_type" NOT NULL,
    "weight" numeric,
    "percentage" integer,
    "rest_time" integer DEFAULT 60,
    "order_index" integer NOT NULL,
    "group_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "tempo" "text",
    "weight_max" numeric,
    "percentage_max" integer,
    "percentage_base_kpi" "text",
    "each_side" boolean DEFAULT false,
    "notes" "text",
    "block_instance_id" "text",
    "substitution_reason" "text",
    "original_exercise" "text",
    "progression_notes" "text",
    "video_url" "text"
);


ALTER TABLE "public"."workout_exercises" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workout_exercises"."video_url" IS 'YouTube URL for exercise demonstration video';



CREATE TABLE IF NOT EXISTS "public"."workout_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "estimated_duration" integer DEFAULT 30,
    "target_group_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "block_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "block_instances" "jsonb" DEFAULT '[]'::"jsonb",
    "archived" boolean DEFAULT false
);


ALTER TABLE "public"."workout_plans" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workout_plans"."block_instances" IS 'Array of block instances used in this workout. Each instance has: id, sourceBlockId, sourceBlockName, instanceName (optional), customizations (tracking changes), notes, estimatedDuration, createdAt, updatedAt';



COMMENT ON COLUMN "public"."workout_plans"."archived" IS 'Marks workout as archived. Archived workouts are hidden from default views but preserved for history.';



CREATE TABLE IF NOT EXISTS "public"."workout_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "workout_plan_id" "uuid" NOT NULL,
    "workout_plan_name" "text" NOT NULL,
    "workout_assignment_id" "uuid",
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "mode" "public"."workout_mode" DEFAULT 'view'::"public"."workout_mode" NOT NULL,
    "started" boolean DEFAULT false,
    "completed" boolean DEFAULT false,
    "progress_percentage" integer DEFAULT 0,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workout_sessions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."athlete_kpi_exercise_history" AS
 SELECT "ws"."user_id" AS "athlete_id",
    "se"."workout_session_id",
    "ws"."completed_at" AS "session_date",
    "wa"."workout_plan_id",
    "wp"."name" AS "workout_name",
    "ekt"."kpi_tag_id",
    "kt"."name" AS "kpi_tag_name",
    "kt"."display_name" AS "kpi_display_name",
    "we"."exercise_id",
    "se"."exercise_name",
    "sr"."set_number",
    "sr"."actual_reps" AS "reps_completed",
    "sr"."actual_weight" AS "weight_used",
    NULL::numeric AS "rpe",
    "we"."sets" AS "prescribed_sets",
    "we"."reps" AS "prescribed_reps",
    "we"."weight" AS "prescribed_weight",
    "we"."weight_type",
    "we"."percentage",
    "we"."percentage_base_kpi",
    "ekt"."relevance_notes"
   FROM ((((((("public"."set_records" "sr"
     JOIN "public"."session_exercises" "se" ON (("sr"."session_exercise_id" = "se"."id")))
     JOIN "public"."workout_exercises" "we" ON (("se"."workout_exercise_id" = "we"."id")))
     JOIN "public"."exercise_kpi_tags" "ekt" ON (("ekt"."workout_exercise_id" = "we"."id")))
     JOIN "public"."kpi_tags" "kt" ON (("ekt"."kpi_tag_id" = "kt"."id")))
     JOIN "public"."workout_sessions" "ws" ON (("se"."workout_session_id" = "ws"."id")))
     JOIN "public"."workout_assignments" "wa" ON (("ws"."workout_assignment_id" = "wa"."id")))
     JOIN "public"."workout_plans" "wp" ON (("wa"."workout_plan_id" = "wp"."id")))
  ORDER BY "ws"."completed_at" DESC, "sr"."set_number";


ALTER VIEW "public"."athlete_kpi_exercise_history" OWNER TO "postgres";


COMMENT ON VIEW "public"."athlete_kpi_exercise_history" IS 'Complete history of exercises tagged with KPIs for analysis';



CREATE OR REPLACE VIEW "public"."athlete_kpi_summary" AS
 SELECT "athlete_id",
    "athlete_name",
    "count"(*) AS "active_kpis",
    "array_agg"("kpi_display_name" ORDER BY "kpi_display_name") AS "kpi_names",
    "array_agg"("kpi_color" ORDER BY "kpi_display_name") AS "kpi_colors"
   FROM "public"."active_athlete_kpis"
  GROUP BY "athlete_id", "athlete_name"
  ORDER BY "athlete_name";


ALTER VIEW "public"."athlete_kpi_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."athlete_kpi_summary" IS 'Summary of active KPIs per athlete';



CREATE TABLE IF NOT EXISTS "public"."athlete_kpis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "exercise_id" "text" NOT NULL,
    "exercise_name" "text" NOT NULL,
    "current_pr" numeric NOT NULL,
    "date_achieved" "date" NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."athlete_kpis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_trail" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "old_values" "jsonb",
    "new_values" "jsonb",
    "performed_by" "uuid",
    "performed_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "user_agent" "text",
    "metadata" "jsonb",
    CONSTRAINT "audit_trail_action_check" CHECK (("action" = ANY (ARRAY['insert'::"text", 'update'::"text", 'delete'::"text", 'soft_delete'::"text", 'restore'::"text"])))
);


ALTER TABLE "public"."audit_trail" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_trail" IS 'Comprehensive audit log for tracking all data modifications';



COMMENT ON COLUMN "public"."audit_trail"."table_name" IS 'Name of the table that was modified';



COMMENT ON COLUMN "public"."audit_trail"."record_id" IS 'ID of the record that was modified';



COMMENT ON COLUMN "public"."audit_trail"."action" IS 'Type of action performed (insert, update, delete, soft_delete, restore)';



COMMENT ON COLUMN "public"."audit_trail"."old_values" IS 'JSON snapshot of record before modification';



COMMENT ON COLUMN "public"."audit_trail"."new_values" IS 'JSON snapshot of record after modification';



COMMENT ON COLUMN "public"."audit_trail"."performed_by" IS 'User who performed the action';



COMMENT ON COLUMN "public"."audit_trail"."metadata" IS 'Additional context (reason, notes, etc.)';



CREATE OR REPLACE VIEW "public"."audit_log_summary" AS
 SELECT "a"."id",
    "a"."table_name",
    "a"."record_id",
    "a"."action",
    "a"."performed_at",
    "a"."performed_by",
    "u"."email" AS "performed_by_email",
    (("u"."first_name" || ' '::"text") || "u"."last_name") AS "performed_by_name",
        CASE
            WHEN ("a"."table_name" = 'invites'::"text") THEN ((COALESCE(("a"."old_values" ->> 'first_name'::"text"), ("a"."new_values" ->> 'first_name'::"text")) || ' '::"text") || COALESCE(("a"."old_values" ->> 'last_name'::"text"), ("a"."new_values" ->> 'last_name'::"text")))
            WHEN ("a"."table_name" = 'users'::"text") THEN ((COALESCE(("a"."old_values" ->> 'first_name'::"text"), ("a"."new_values" ->> 'first_name'::"text")) || ' '::"text") || COALESCE(("a"."old_values" ->> 'last_name'::"text"), ("a"."new_values" ->> 'last_name'::"text")))
            ELSE NULL::"text"
        END AS "record_name",
    "a"."old_values",
    "a"."new_values"
   FROM ("public"."audit_trail" "a"
     LEFT JOIN "public"."users" "u" ON (("a"."performed_by" = "u"."id")))
  ORDER BY "a"."performed_at" DESC;


ALTER VIEW "public"."audit_log_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."block_exercise_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "block_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "order_index" integer NOT NULL,
    "rest_between_rounds" integer,
    "rest_between_exercises" integer,
    "rounds" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "block_exercise_groups_type_check" CHECK (("type" = ANY (ARRAY['superset'::"text", 'circuit'::"text", 'section'::"text"])))
);


ALTER TABLE "public"."block_exercise_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."block_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "block_id" "uuid",
    "exercise_id" "text" NOT NULL,
    "exercise_name" "text" NOT NULL,
    "sets" integer NOT NULL,
    "reps" integer NOT NULL,
    "weight_type" "public"."weight_type" NOT NULL,
    "weight" numeric,
    "weight_max" numeric,
    "percentage" integer,
    "percentage_max" integer,
    "percentage_base_kpi" "text",
    "tempo" "text",
    "each_side" boolean DEFAULT false,
    "rest_time" integer DEFAULT 60,
    "notes" "text",
    "order_index" integer NOT NULL,
    "group_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."block_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bulk_operations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "performed_by" "uuid" NOT NULL,
    "operation_type" "text" NOT NULL,
    "target_count" integer NOT NULL,
    "success_count" integer DEFAULT 0,
    "failure_count" integer DEFAULT 0,
    "details" "jsonb",
    "status" "text" DEFAULT 'in_progress'::"text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "bulk_operations_operation_type_check" CHECK (("operation_type" = ANY (ARRAY['bulk_invite'::"text", 'bulk_message'::"text", 'bulk_assign_workout'::"text", 'bulk_update_status'::"text"]))),
    CONSTRAINT "bulk_operations_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."bulk_operations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coach_program_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "program_name" "text" DEFAULT 'Weight Lifting Club'::"text",
    "program_description" "text" DEFAULT 'Building strength, character, and champions'::"text",
    "welcome_message" "text" DEFAULT 'Welcome to our strength program! I''m excited to work with you and help you achieve your goals. Let''s get stronger together!'::"text",
    "warmup_template" "jsonb" DEFAULT '{"enabled": true, "duration": 10, "exercises": ["5 min light cardio (jog, bike, or rowing)", "Dynamic stretches: arm circles, leg swings, hip openers", "Activation: band pull-aparts, glute bridges", "Movement prep: 1-2 light sets of first exercise"], "instructions": "Complete the following warmup before starting your workout:"}'::"jsonb",
    "email_signature" "text" DEFAULT 'Coach\nWeight Lifting Club'::"text",
    "email_branding" "jsonb" DEFAULT '{"primaryColor": "#3b82f6"}'::"jsonb",
    "default_rest_time" integer DEFAULT 90,
    "default_workout_duration" integer DEFAULT 60,
    "auto_calculate_1rm" boolean DEFAULT true,
    "athlete_welcome_checklist" "text"[] DEFAULT ARRAY['Review safety rules and gym etiquette'::"text", 'Learn proper barbell technique'::"text", 'Establish baseline 1RM numbers'::"text", 'Set personal goals for the season'::"text"],
    "required_fields" "jsonb" DEFAULT '{"dateOfBirth": true, "injuryStatus": true, "emergencyContact": false}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."coach_program_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."coach_program_settings" IS 'Stores coach-level program customization settings including branding, warmup templates, and default preferences';



CREATE OR REPLACE VIEW "public"."coach_unread_feedback" AS
 SELECT "wf"."id",
    "wf"."workout_session_id",
    "wf"."athlete_id",
    "wf"."difficulty_rating",
    "wf"."difficulty_notes",
    "wf"."soreness_level",
    "wf"."soreness_areas",
    "wf"."energy_level",
    "wf"."enjoyed",
    "wf"."what_went_well",
    "wf"."what_was_difficult",
    "wf"."suggestions",
    "wf"."coach_viewed",
    "wf"."coach_response",
    "wf"."coach_responded_at",
    "wf"."created_at",
    "wf"."updated_at",
    (("u"."first_name" || ' '::"text") || "u"."last_name") AS "athlete_name",
    "u"."email" AS "athlete_email",
    "ws"."workout_plan_id",
    "ws"."completed_at" AS "workout_completed_at",
    "wp"."name" AS "workout_name"
   FROM ((("public"."workout_feedback" "wf"
     JOIN "public"."users" "u" ON (("wf"."athlete_id" = "u"."id")))
     JOIN "public"."workout_sessions" "ws" ON (("wf"."workout_session_id" = "ws"."id")))
     LEFT JOIN "public"."workout_plans" "wp" ON (("ws"."workout_plan_id" = "wp"."id")))
  WHERE ("wf"."coach_viewed" = false)
  ORDER BY "wf"."created_at" DESC;


ALTER VIEW "public"."coach_unread_feedback" OWNER TO "postgres";


COMMENT ON VIEW "public"."coach_unread_feedback" IS 'All unviewed feedback with athlete and workout details';



CREATE TABLE IF NOT EXISTS "public"."communication_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "preferred_contact" "text" DEFAULT 'app'::"text",
    "notifications_enabled" boolean DEFAULT true,
    "email_notifications" boolean DEFAULT true,
    "workout_reminders" boolean DEFAULT true,
    "progress_updates" boolean DEFAULT true,
    "message_notifications" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "communication_preferences_preferred_contact_check" CHECK (("preferred_contact" = ANY (ARRAY['app'::"text", 'email'::"text", 'sms'::"text"])))
);


ALTER TABLE "public"."communication_preferences" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."deleted_athletes" AS
 SELECT "u"."id",
    "u"."email",
    "u"."name",
    "u"."role",
    "u"."group_ids",
    "u"."coach_id",
    "u"."date_of_birth",
    "u"."injury_status",
    "u"."created_at",
    "u"."updated_at",
    "u"."bio",
    "u"."profile_image_url",
    "u"."phone_number",
    "u"."emergency_contact_name",
    "u"."emergency_contact_phone",
    "u"."last_activity_at",
    "u"."status",
    "u"."first_name",
    "u"."last_name",
    "u"."full_name",
    "u"."avatar_url",
    "u"."height_inches",
    "u"."weight_lbs",
    "u"."gender",
    "u"."notification_preferences",
    "u"."notes",
    "u"."deleted_at",
    "a"."performed_at" AS "audit_deleted_at",
    "a"."reason" AS "deletion_reason",
    (("deleter"."first_name" || ' '::"text") || "deleter"."last_name") AS "deleted_by_name"
   FROM (("public"."users" "u"
     LEFT JOIN "public"."athlete_audit_log" "a" ON ((("a"."record_id" = "u"."id") AND (("a"."action")::"text" = 'delete'::"text"))))
     LEFT JOIN "public"."users" "deleter" ON (("deleter"."id" = "a"."performed_by")))
  WHERE (("u"."role" = 'athlete'::"public"."user_role") AND ("u"."deleted_at" IS NOT NULL))
  ORDER BY "u"."deleted_at" DESC;


ALTER VIEW "public"."deleted_athletes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "availability" "text" DEFAULT 'common'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."equipment_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exercise_id" "uuid",
    "usage_count" integer DEFAULT 0,
    "avg_rating" numeric(3,2) DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exercise_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#6366f1'::"text",
    "icon" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exercise_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_muscle_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exercise_id" "uuid",
    "muscle_group_id" "uuid",
    "involvement_type" "text" DEFAULT 'primary'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exercise_muscle_groups_involvement_type_check" CHECK (("involvement_type" = ANY (ARRAY['primary'::"text", 'secondary'::"text", 'stabilizer'::"text"])))
);


ALTER TABLE "public"."exercise_muscle_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_variations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_exercise_id" "uuid",
    "variation_exercise_id" "uuid",
    "variation_type" "text" NOT NULL,
    "reason" "text",
    "difficulty_modifier" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exercise_variations_variation_type_check" CHECK (("variation_type" = ANY (ARRAY['easier'::"text", 'harder'::"text", 'equipment'::"text", 'angle'::"text", 'grip'::"text", 'range'::"text"])))
);


ALTER TABLE "public"."exercise_variations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "instructions" "jsonb" DEFAULT '[]'::"jsonb",
    "difficulty_level" integer DEFAULT 1,
    "equipment_needed" "text"[] DEFAULT '{}'::"text"[],
    "is_compound" boolean DEFAULT false,
    "is_bodyweight" boolean DEFAULT false,
    "is_unilateral" boolean DEFAULT false,
    "estimated_duration_minutes" integer DEFAULT 5,
    "safety_notes" "text",
    "video_url" "text",
    "image_url" "text",
    "created_by" "uuid",
    "is_active" boolean DEFAULT true,
    "is_approved" boolean DEFAULT false,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exercises_difficulty_level_check" CHECK ((("difficulty_level" >= 1) AND ("difficulty_level" <= 5)))
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."in_app_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "icon" "text",
    "url" "text",
    "read" boolean DEFAULT false,
    "clicked" boolean DEFAULT false,
    "priority" "text" DEFAULT 'normal'::"text",
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    CONSTRAINT "in_app_notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "in_app_notifications_type_check" CHECK (("type" = ANY (ARRAY['workout'::"text", 'message'::"text", 'assignment'::"text", 'progress'::"text", 'achievement'::"text"])))
);


ALTER TABLE "public"."in_app_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invite_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invite_id" "uuid",
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "target_id" "uuid",
    "ip_address" "text",
    "user_agent" "text",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "invite_audit_log_event_type_check" CHECK (("event_type" = ANY (ARRAY['created'::"text", 'sent'::"text", 'resent'::"text", 'accepted'::"text", 'verified'::"text", 'expired'::"text", 'cancelled'::"text", 'email_changed'::"text", 'suspicious_activity'::"text"])))
);


ALTER TABLE "public"."invite_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."invite_audit_log" IS 'Comprehensive audit trail for all invite-related events';



COMMENT ON COLUMN "public"."invite_audit_log"."event_type" IS 'Type of event: created, sent, resent, accepted, verified, expired, cancelled, email_changed, suspicious_activity';



COMMENT ON COLUMN "public"."invite_audit_log"."actor_id" IS 'User who performed the action (coach, athlete, or system)';



COMMENT ON COLUMN "public"."invite_audit_log"."target_id" IS 'User who was affected by the action (usually the athlete)';



COMMENT ON COLUMN "public"."invite_audit_log"."metadata" IS 'Flexible JSONB field for event-specific data';



CREATE TABLE IF NOT EXISTS "public"."invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "full_name" "text" GENERATED ALWAYS AS ((("first_name" || ' '::"text") || "last_name")) STORED,
    "invited_by" "uuid",
    "role" "text" DEFAULT 'athlete'::"text" NOT NULL,
    "group_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "bio" "text",
    "date_of_birth" "date",
    "injury_status" "text",
    "group_ids" "text"[] DEFAULT '{}'::"text"[],
    "deleted_at" timestamp with time zone,
    "accepted_ip" "text",
    "accepted_user_agent" "text",
    "resend_count" integer DEFAULT 0,
    "last_sent_at" timestamp without time zone,
    CONSTRAINT "invites_pending_must_have_email" CHECK (((("status" = 'pending'::"text") AND ("email" IS NOT NULL)) OR ("status" <> 'pending'::"text"))),
    CONSTRAINT "invites_pending_must_have_email_and_expiry" CHECK (((("status" = 'pending'::"text") AND ("email" IS NOT NULL) AND ("expires_at" IS NOT NULL)) OR ("status" <> 'pending'::"text")))
);


ALTER TABLE "public"."invites" OWNER TO "postgres";


COMMENT ON TABLE "public"."invites" IS 'Athlete invitations. Duplicates are prevented by the API checking for existing pending invites before creation.';



COMMENT ON COLUMN "public"."invites"."email" IS 'Email address for the invite (nullable to support draft invites without email)';



COMMENT ON COLUMN "public"."invites"."expires_at" IS 'Expiration timestamp for the invite (nullable for draft invites that have no expiration)';



COMMENT ON COLUMN "public"."invites"."notes" IS 'Coach notes about the athlete (transfers to user profile on acceptance)';



COMMENT ON COLUMN "public"."invites"."bio" IS 'Athlete bio/description (transfers to user profile on acceptance)';



COMMENT ON COLUMN "public"."invites"."date_of_birth" IS 'Athlete date of birth (transfers to user profile on acceptance)';



COMMENT ON COLUMN "public"."invites"."injury_status" IS 'Current injury status (transfers to user profile on acceptance)';



COMMENT ON COLUMN "public"."invites"."group_ids" IS 'Array of group IDs the athlete should be added to (replaces single group_id)';



COMMENT ON CONSTRAINT "invites_pending_must_have_email" ON "public"."invites" IS 'Ensures pending invites always have an email address, but draft invites can be created without email';



COMMENT ON CONSTRAINT "invites_pending_must_have_email_and_expiry" ON "public"."invites" IS 'Ensures pending invites always have an email address and expiration date, but draft invites can be created without either';



CREATE OR REPLACE VIEW "public"."kpi_tag_volume_summary" AS
 SELECT "athlete_id",
    "kpi_tag_id",
    "kpi_tag_name",
    "kpi_display_name",
    "date_trunc"('week'::"text", "session_date") AS "week_start",
    "count"(DISTINCT "workout_session_id") AS "workouts_completed",
    "count"(DISTINCT "exercise_id") AS "unique_exercises",
    "sum"("reps_completed") AS "total_reps",
    "sum"((("reps_completed")::numeric * COALESCE("weight_used", (0)::numeric))) AS "total_volume",
    "avg"("rpe") AS "avg_rpe",
    "max"("weight_used") AS "max_weight"
   FROM "public"."athlete_kpi_exercise_history"
  GROUP BY "athlete_id", "kpi_tag_id", "kpi_tag_name", "kpi_display_name", ("date_trunc"('week'::"text", "session_date"))
  ORDER BY "athlete_id", ("date_trunc"('week'::"text", "session_date")) DESC;


ALTER VIEW "public"."kpi_tag_volume_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."kpi_tag_volume_summary" IS 'Weekly volume summary per KPI tag per athlete';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "subject" "text",
    "message" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "parent_message_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."muscle_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."muscle_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "url" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "delivered" boolean DEFAULT false,
    "opened" boolean DEFAULT false,
    "clicked" boolean DEFAULT false,
    "clicked_at" timestamp with time zone,
    "error" "text",
    "retry_count" integer DEFAULT 0,
    "device_info" "jsonb",
    "email_id" "text",
    CONSTRAINT "notification_log_type_check" CHECK (("type" = ANY (ARRAY['push'::"text", 'email'::"text"])))
);


ALTER TABLE "public"."notification_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "user_id" "uuid" NOT NULL,
    "push_enabled" boolean DEFAULT true,
    "email_enabled" boolean DEFAULT true,
    "workout_reminders" boolean DEFAULT true,
    "assignment_notifications" boolean DEFAULT true,
    "message_notifications" boolean DEFAULT true,
    "progress_updates" boolean DEFAULT false,
    "achievement_notifications" boolean DEFAULT true,
    "quiet_hours" "jsonb",
    "preferred_contact" "text" DEFAULT 'push'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notification_preferences_preferred_contact_check" CHECK (("preferred_contact" = ANY (ARRAY['push'::"text", 'email'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."notification_stats" AS
 SELECT "type",
    "category",
    "date"("sent_at") AS "date",
    "count"(*) AS "total_sent",
    "sum"(
        CASE
            WHEN "delivered" THEN 1
            ELSE 0
        END) AS "delivered_count",
    "sum"(
        CASE
            WHEN "opened" THEN 1
            ELSE 0
        END) AS "opened_count",
    "sum"(
        CASE
            WHEN "clicked" THEN 1
            ELSE 0
        END) AS "clicked_count",
    "round"(((100.0 * ("sum"(
        CASE
            WHEN "delivered" THEN 1
            ELSE 0
        END))::numeric) / ("count"(*))::numeric), 2) AS "delivery_rate",
    "round"(((100.0 * ("sum"(
        CASE
            WHEN "clicked" THEN 1
            ELSE 0
        END))::numeric) / (NULLIF("sum"(
        CASE
            WHEN "delivered" THEN 1
            ELSE 0
        END), 0))::numeric), 2) AS "click_through_rate"
   FROM "public"."notification_log"
  GROUP BY "type", "category", ("date"("sent_at"));


ALTER VIEW "public"."notification_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['message'::"text", 'workout_assigned'::"text", 'progress_milestone'::"text", 'workout_reminder'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progress_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_workouts" integer DEFAULT 0,
    "total_sets" integer DEFAULT 0,
    "total_volume" numeric DEFAULT 0,
    "prs_achieved" integer DEFAULT 0,
    "workout_streak" integer DEFAULT 0,
    "avg_workout_duration" integer DEFAULT 0,
    "top_exercises" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progress_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "exercise_id" "text" NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "weight" numeric NOT NULL,
    "reps" integer NOT NULL,
    "one_rep_max" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "device_name" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_used" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tos_versions" (
    "id" integer NOT NULL,
    "version" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "effective_date" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."tos_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."tos_versions" IS 'Historical record of Terms of Service versions';



COMMENT ON COLUMN "public"."tos_versions"."effective_date" IS 'Date when this version becomes effective';



CREATE SEQUENCE IF NOT EXISTS "public"."tos_versions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tos_versions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tos_versions_id_seq" OWNED BY "public"."tos_versions"."id";



CREATE TABLE IF NOT EXISTS "public"."user_exercise_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "exercise_id" "uuid",
    "rating" integer,
    "notes" "text",
    "is_favorite" boolean DEFAULT false,
    "is_restricted" boolean DEFAULT false,
    "restriction_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_exercise_preferences_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."user_exercise_preferences" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_notification_summary" AS
 SELECT "u"."id" AS "user_id",
    "u"."first_name",
    "u"."last_name",
    "u"."email",
    "count"("n"."id") AS "total_notifications",
    "sum"(
        CASE
            WHEN (NOT "n"."read") THEN 1
            ELSE 0
        END) AS "unread_count",
    "max"("n"."created_at") AS "last_notification_at"
   FROM ("public"."users" "u"
     LEFT JOIN "public"."in_app_notifications" "n" ON (("n"."user_id" = "u"."id")))
  WHERE (("n"."expires_at" IS NULL) OR ("n"."expires_at" > "now"()))
  GROUP BY "u"."id", "u"."first_name", "u"."last_name", "u"."email";


ALTER VIEW "public"."user_notification_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."users_with_metrics" AS
 SELECT "id",
    "email",
    "name",
    "role",
    "group_ids",
    "coach_id",
    "date_of_birth",
    "injury_status",
    "created_at",
    "updated_at",
    "bio",
    "profile_image_url",
    "phone_number",
    "emergency_contact_name",
    "emergency_contact_phone",
    "last_activity_at",
    "status",
    "first_name",
    "last_name",
    "full_name",
    "avatar_url",
    "height_inches",
    "weight_lbs",
    "gender",
    "public"."calculate_age"("date_of_birth") AS "age",
    "public"."calculate_bmi"("height_inches", "weight_lbs") AS "bmi",
        CASE
            WHEN ("public"."calculate_bmi"("height_inches", "weight_lbs") < 18.5) THEN 'underweight'::"text"
            WHEN (("public"."calculate_bmi"("height_inches", "weight_lbs") >= 18.5) AND ("public"."calculate_bmi"("height_inches", "weight_lbs") < (25)::numeric)) THEN 'normal'::"text"
            WHEN (("public"."calculate_bmi"("height_inches", "weight_lbs") >= (25)::numeric) AND ("public"."calculate_bmi"("height_inches", "weight_lbs") < (30)::numeric)) THEN 'overweight'::"text"
            WHEN ("public"."calculate_bmi"("height_inches", "weight_lbs") >= (30)::numeric) THEN 'obese'::"text"
            ELSE 'unknown'::"text"
        END AS "bmi_category"
   FROM "public"."users" "u";


ALTER VIEW "public"."users_with_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_block_instances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_plan_id" "uuid",
    "source_block_id" "uuid",
    "source_block_name" "text" NOT NULL,
    "instance_name" "text",
    "notes" "text",
    "estimated_duration" integer,
    "modified_exercises" "text"[] DEFAULT '{}'::"text"[],
    "added_exercises" "text"[] DEFAULT '{}'::"text"[],
    "removed_exercises" "text"[] DEFAULT '{}'::"text"[],
    "modified_groups" "text"[] DEFAULT '{}'::"text"[],
    "added_groups" "text"[] DEFAULT '{}'::"text"[],
    "removed_groups" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workout_block_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(50) NOT NULL,
    "exercises" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "groups" "jsonb" DEFAULT '[]'::"jsonb",
    "estimated_duration" integer DEFAULT 0 NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_template" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone,
    "is_favorite" boolean DEFAULT false,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workout_blocks_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['warmup'::character varying, 'main'::character varying, 'accessory'::character varying, 'cooldown'::character varying, 'custom'::character varying])::"text"[]))),
    CONSTRAINT "workout_blocks_name_check" CHECK (("length"(("name")::"text") > 0))
);


ALTER TABLE "public"."workout_blocks" OWNER TO "postgres";


COMMENT ON TABLE "public"."workout_blocks" IS 'Contains pre-built workout block templates for quick workout construction';



COMMENT ON COLUMN "public"."workout_blocks"."category" IS 'Block type: warmup, main, accessory, cooldown, or custom';



COMMENT ON COLUMN "public"."workout_blocks"."exercises" IS 'JSONB array of WorkoutExercise objects';



COMMENT ON COLUMN "public"."workout_blocks"."groups" IS 'JSONB array of ExerciseGroup objects for organization';



COMMENT ON COLUMN "public"."workout_blocks"."tags" IS 'Array of tags for filtering (e.g., push, pull, legs)';



COMMENT ON COLUMN "public"."workout_blocks"."is_template" IS 'System template (true) or user-created (false)';



COMMENT ON COLUMN "public"."workout_blocks"."usage_count" IS 'Number of times this block has been used';



CREATE TABLE IF NOT EXISTS "public"."workout_exercise_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_plan_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "order_index" integer NOT NULL,
    "rest_between_rounds" integer,
    "rest_between_exercises" integer,
    "rounds" integer,
    "notes" "text",
    "block_instance_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workout_exercise_groups_type_check" CHECK (("type" = ANY (ARRAY['superset'::"text", 'circuit'::"text", 'section'::"text"])))
);


ALTER TABLE "public"."workout_exercise_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_session_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "difficulty_rating" integer,
    "soreness_rating" integer,
    "energy_level" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workout_session_feedback_difficulty_rating_check" CHECK ((("difficulty_rating" >= 1) AND ("difficulty_rating" <= 5))),
    CONSTRAINT "workout_session_feedback_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 5))),
    CONSTRAINT "workout_session_feedback_soreness_rating_check" CHECK ((("soreness_rating" >= 1) AND ("soreness_rating" <= 5)))
);


ALTER TABLE "public"."workout_session_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."workout_session_feedback" IS 'Athlete feedback after completing workout sessions';



COMMENT ON COLUMN "public"."workout_session_feedback"."difficulty_rating" IS 'How difficult was the workout? 1=Too Easy, 5=Too Hard';



COMMENT ON COLUMN "public"."workout_session_feedback"."soreness_rating" IS 'How sore are you? 1=Not Sore, 5=Very Sore';



COMMENT ON COLUMN "public"."workout_session_feedback"."energy_level" IS 'Energy level during workout? 1=Very Low, 5=Very High';



COMMENT ON COLUMN "public"."workout_session_feedback"."notes" IS 'Optional text feedback from athlete';



ALTER TABLE ONLY "public"."tos_versions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tos_versions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_achievements"
    ADD CONSTRAINT "athlete_achievements_athlete_id_achievement_type_key" UNIQUE ("athlete_id", "achievement_type");



ALTER TABLE ONLY "public"."athlete_achievements"
    ADD CONSTRAINT "athlete_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_assigned_kpis"
    ADD CONSTRAINT "athlete_assigned_kpis_athlete_id_kpi_tag_id_is_active_key" UNIQUE ("athlete_id", "kpi_tag_id", "is_active");



ALTER TABLE ONLY "public"."athlete_assigned_kpis"
    ADD CONSTRAINT "athlete_assigned_kpis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_audit_log"
    ADD CONSTRAINT "athlete_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_groups"
    ADD CONSTRAINT "athlete_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_kpis"
    ADD CONSTRAINT "athlete_kpis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_trail"
    ADD CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."block_exercise_groups"
    ADD CONSTRAINT "block_exercise_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."block_exercises"
    ADD CONSTRAINT "block_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_operations"
    ADD CONSTRAINT "bulk_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coach_program_settings"
    ADD CONSTRAINT "coach_program_settings_coach_id_unique" UNIQUE ("coach_id");



ALTER TABLE ONLY "public"."coach_program_settings"
    ADD CONSTRAINT "coach_program_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communication_preferences"
    ADD CONSTRAINT "communication_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communication_preferences"
    ADD CONSTRAINT "communication_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."equipment_types"
    ADD CONSTRAINT "equipment_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."equipment_types"
    ADD CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_analytics"
    ADD CONSTRAINT "exercise_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_categories"
    ADD CONSTRAINT "exercise_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."exercise_categories"
    ADD CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_kpi_tags"
    ADD CONSTRAINT "exercise_kpi_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_kpi_tags"
    ADD CONSTRAINT "exercise_kpi_tags_workout_exercise_id_kpi_tag_id_key" UNIQUE ("workout_exercise_id", "kpi_tag_id");



ALTER TABLE ONLY "public"."exercise_muscle_groups"
    ADD CONSTRAINT "exercise_muscle_groups_exercise_id_muscle_group_id_key" UNIQUE ("exercise_id", "muscle_group_id");



ALTER TABLE ONLY "public"."exercise_muscle_groups"
    ADD CONSTRAINT "exercise_muscle_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_variations"
    ADD CONSTRAINT "exercise_variations_parent_exercise_id_variation_exercise_i_key" UNIQUE ("parent_exercise_id", "variation_exercise_id");



ALTER TABLE ONLY "public"."exercise_variations"
    ADD CONSTRAINT "exercise_variations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."in_app_notifications"
    ADD CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."in_app_notifications"
    ADD CONSTRAINT "in_app_notifications_user_id_type_title_created_at_key" UNIQUE ("user_id", "type", "title", "created_at");



ALTER TABLE ONLY "public"."invite_audit_log"
    ADD CONSTRAINT "invite_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kpi_tags"
    ADD CONSTRAINT "kpi_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."kpi_tags"
    ADD CONSTRAINT "kpi_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."muscle_groups"
    ADD CONSTRAINT "muscle_groups_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."muscle_groups"
    ADD CONSTRAINT "muscle_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_log"
    ADD CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress_analytics"
    ADD CONSTRAINT "progress_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress_analytics"
    ADD CONSTRAINT "progress_analytics_user_id_period_start_period_end_key" UNIQUE ("user_id", "period_start", "period_end");



ALTER TABLE ONLY "public"."progress_entries"
    ADD CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_endpoint_key" UNIQUE ("user_id", "endpoint");



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."set_records"
    ADD CONSTRAINT "set_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tos_versions"
    ADD CONSTRAINT "tos_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tos_versions"
    ADD CONSTRAINT "tos_versions_version_key" UNIQUE ("version");



ALTER TABLE ONLY "public"."user_exercise_preferences"
    ADD CONSTRAINT "user_exercise_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_exercise_preferences"
    ADD CONSTRAINT "user_exercise_preferences_user_id_exercise_id_key" UNIQUE ("user_id", "exercise_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_assignments"
    ADD CONSTRAINT "workout_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_block_instances"
    ADD CONSTRAINT "workout_block_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_blocks"
    ADD CONSTRAINT "workout_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_exercise_groups"
    ADD CONSTRAINT "workout_exercise_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_feedback"
    ADD CONSTRAINT "workout_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_session_feedback"
    ADD CONSTRAINT "workout_session_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_session_feedback"
    ADD CONSTRAINT "workout_session_feedback_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_log_action_type" ON "public"."activity_log" USING "btree" ("action_type");



CREATE INDEX "idx_activity_log_user_created" ON "public"."activity_log" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_assignments_assigned_by" ON "public"."workout_assignments" USING "btree" ("assigned_by");



CREATE INDEX "idx_assignments_completed" ON "public"."workout_assignments" USING "btree" ("completed");



CREATE INDEX "idx_assignments_group_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_group_id", "scheduled_date");



CREATE INDEX "idx_assignments_group_date_new" ON "public"."workout_assignments" USING "btree" ("assigned_to_group_id", "scheduled_date") WHERE ("assigned_to_group_id" IS NOT NULL);



CREATE INDEX "idx_assignments_reminder_pending" ON "public"."workout_assignments" USING "btree" ("scheduled_date", "reminder_sent") WHERE ("reminder_sent" = false);



CREATE INDEX "idx_assignments_scheduled_date" ON "public"."workout_assignments" USING "btree" ("scheduled_date");



CREATE INDEX "idx_assignments_user_completed_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id", "completed", "scheduled_date");



CREATE INDEX "idx_assignments_user_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id", "scheduled_date");



CREATE INDEX "idx_athlete_achievements_athlete_id" ON "public"."athlete_achievements" USING "btree" ("athlete_id");



CREATE INDEX "idx_athlete_achievements_earned_at" ON "public"."athlete_achievements" USING "btree" ("earned_at" DESC);



CREATE INDEX "idx_athlete_assigned_kpis_active" ON "public"."athlete_assigned_kpis" USING "btree" ("athlete_id", "is_active");



CREATE INDEX "idx_athlete_assigned_kpis_assigned_by" ON "public"."athlete_assigned_kpis" USING "btree" ("assigned_by");



CREATE INDEX "idx_athlete_assigned_kpis_athlete" ON "public"."athlete_assigned_kpis" USING "btree" ("athlete_id");



CREATE INDEX "idx_athlete_assigned_kpis_kpi_tag" ON "public"."athlete_assigned_kpis" USING "btree" ("kpi_tag_id");



CREATE INDEX "idx_athlete_groups_archived" ON "public"."athlete_groups" USING "btree" ("archived");



CREATE INDEX "idx_athlete_groups_coach_id" ON "public"."athlete_groups" USING "btree" ("coach_id");



CREATE INDEX "idx_athlete_kpis_athlete_id" ON "public"."athlete_kpis" USING "btree" ("athlete_id");



CREATE INDEX "idx_audit_log_performed_at" ON "public"."athlete_audit_log" USING "btree" ("performed_at" DESC);



CREATE INDEX "idx_audit_log_record" ON "public"."athlete_audit_log" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_audit_trail_action" ON "public"."audit_trail" USING "btree" ("action");



CREATE INDEX "idx_audit_trail_performed_at" ON "public"."audit_trail" USING "btree" ("performed_at" DESC);



CREATE INDEX "idx_audit_trail_performed_by" ON "public"."audit_trail" USING "btree" ("performed_by");



CREATE INDEX "idx_audit_trail_record_id" ON "public"."audit_trail" USING "btree" ("record_id");



CREATE INDEX "idx_audit_trail_table_name" ON "public"."audit_trail" USING "btree" ("table_name");



CREATE INDEX "idx_block_exercise_groups_block_id" ON "public"."block_exercise_groups" USING "btree" ("block_id");



CREATE INDEX "idx_block_exercises_block_id" ON "public"."block_exercises" USING "btree" ("block_id");



CREATE INDEX "idx_block_instances_plan_id" ON "public"."workout_block_instances" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_bulk_operations_performed_by" ON "public"."bulk_operations" USING "btree" ("performed_by");



CREATE INDEX "idx_bulk_operations_status" ON "public"."bulk_operations" USING "btree" ("status");



CREATE INDEX "idx_coach_program_settings_coach_id" ON "public"."coach_program_settings" USING "btree" ("coach_id");



CREATE INDEX "idx_exercise_kpi_tags_kpi_tag" ON "public"."exercise_kpi_tags" USING "btree" ("kpi_tag_id");



CREATE INDEX "idx_exercise_kpi_tags_workout_exercise" ON "public"."exercise_kpi_tags" USING "btree" ("workout_exercise_id");



CREATE INDEX "idx_exercise_muscle_groups_exercise" ON "public"."exercise_muscle_groups" USING "btree" ("exercise_id");



CREATE INDEX "idx_exercise_muscle_groups_muscle" ON "public"."exercise_muscle_groups" USING "btree" ("muscle_group_id");



CREATE INDEX "idx_exercise_variations_parent" ON "public"."exercise_variations" USING "btree" ("parent_exercise_id");



CREATE INDEX "idx_exercises_active" ON "public"."exercises" USING "btree" ("is_active");



CREATE INDEX "idx_exercises_approved" ON "public"."exercises" USING "btree" ("is_approved");



CREATE INDEX "idx_exercises_bodyweight" ON "public"."exercises" USING "btree" ("is_bodyweight");



CREATE INDEX "idx_exercises_category" ON "public"."exercises" USING "btree" ("category_id");



CREATE INDEX "idx_exercises_category_id" ON "public"."exercises" USING "btree" ("category_id");



CREATE INDEX "idx_exercises_compound" ON "public"."exercises" USING "btree" ("is_compound");



CREATE INDEX "idx_exercises_created_by" ON "public"."exercises" USING "btree" ("created_by");



CREATE INDEX "idx_exercises_difficulty" ON "public"."exercises" USING "btree" ("difficulty_level");



CREATE INDEX "idx_exercises_name" ON "public"."exercises" USING "btree" ("name");



CREATE INDEX "idx_feedback_athlete" ON "public"."workout_feedback" USING "btree" ("athlete_id");



CREATE INDEX "idx_feedback_created" ON "public"."workout_feedback" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_feedback_session" ON "public"."workout_feedback" USING "btree" ("workout_session_id");



CREATE INDEX "idx_feedback_unviewed" ON "public"."workout_feedback" USING "btree" ("coach_viewed", "created_at" DESC) WHERE ("coach_viewed" = false);



CREATE INDEX "idx_groups_archived" ON "public"."athlete_groups" USING "btree" ("archived");



CREATE INDEX "idx_groups_coach" ON "public"."athlete_groups" USING "btree" ("coach_id");



CREATE INDEX "idx_in_app_notifs_created" ON "public"."in_app_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_in_app_notifs_expires" ON "public"."in_app_notifications" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_in_app_notifs_unread" ON "public"."in_app_notifications" USING "btree" ("user_id", "read") WHERE ("read" = false);



CREATE INDEX "idx_in_app_notifs_user_id" ON "public"."in_app_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_invite_audit_log_actor" ON "public"."invite_audit_log" USING "btree" ("actor_id");



CREATE INDEX "idx_invite_audit_log_created" ON "public"."invite_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_invite_audit_log_event" ON "public"."invite_audit_log" USING "btree" ("event_type");



CREATE INDEX "idx_invite_audit_log_invite" ON "public"."invite_audit_log" USING "btree" ("invite_id");



CREATE INDEX "idx_invites_email" ON "public"."invites" USING "btree" ("email");



CREATE INDEX "idx_invites_expires_at" ON "public"."invites" USING "btree" ("expires_at");



CREATE INDEX "idx_invites_first_name" ON "public"."invites" USING "btree" ("first_name");



CREATE INDEX "idx_invites_full_name" ON "public"."invites" USING "btree" ("full_name");



CREATE INDEX "idx_invites_group_ids" ON "public"."invites" USING "gin" ("group_ids");



CREATE INDEX "idx_invites_invited_by" ON "public"."invites" USING "btree" ("invited_by");



CREATE INDEX "idx_invites_last_name" ON "public"."invites" USING "btree" ("last_name");



CREATE INDEX "idx_invites_status" ON "public"."invites" USING "btree" ("status");



CREATE INDEX "idx_kpi_tags_created_by" ON "public"."kpi_tags" USING "btree" ("created_by");



CREATE INDEX "idx_kpi_tags_name" ON "public"."kpi_tags" USING "btree" ("name");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at");



CREATE INDEX "idx_messages_recipient" ON "public"."messages" USING "btree" ("recipient_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_unread" ON "public"."messages" USING "btree" ("recipient_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_notif_log_delivered" ON "public"."notification_log" USING "btree" ("delivered", "sent_at");



CREATE INDEX "idx_notif_log_sent_at" ON "public"."notification_log" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_notif_log_type_category" ON "public"."notification_log" USING "btree" ("type", "category");



CREATE INDEX "idx_notif_log_user_sent" ON "public"."notification_log" USING "btree" ("user_id", "sent_at" DESC);



CREATE INDEX "idx_notif_prefs_user_id" ON "public"."notification_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("user_id", "read_at");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_progress_analytics_user_period" ON "public"."progress_analytics" USING "btree" ("user_id", "period_start", "period_end");



CREATE INDEX "idx_progress_entries_user_exercise" ON "public"."progress_entries" USING "btree" ("user_id", "exercise_id");



CREATE INDEX "idx_push_subs_last_used" ON "public"."push_subscriptions" USING "btree" ("last_used" DESC);



CREATE INDEX "idx_push_subs_user_id" ON "public"."push_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_session_exercises_group_id" ON "public"."session_exercises" USING "btree" ("group_id");



CREATE INDEX "idx_session_exercises_session" ON "public"."session_exercises" USING "btree" ("workout_session_id", "exercise_name");



CREATE INDEX "idx_session_exercises_session_id" ON "public"."session_exercises" USING "btree" ("workout_session_id");



CREATE INDEX "idx_sessions_assignment" ON "public"."workout_sessions" USING "btree" ("workout_assignment_id") WHERE ("workout_assignment_id" IS NOT NULL);



CREATE INDEX "idx_sessions_user_completed" ON "public"."workout_sessions" USING "btree" ("user_id", "completed", "completed_at" DESC) WHERE ("completed" = true);



CREATE INDEX "idx_sessions_user_date" ON "public"."workout_sessions" USING "btree" ("user_id", "completed_at" DESC NULLS LAST);



CREATE INDEX "idx_set_records_session_exercise" ON "public"."set_records" USING "btree" ("session_exercise_id");



CREATE INDEX "idx_user_preferences_exercise" ON "public"."user_exercise_preferences" USING "btree" ("exercise_id");



CREATE INDEX "idx_user_preferences_user" ON "public"."user_exercise_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_users_avatar_url" ON "public"."users" USING "btree" ("avatar_url") WHERE ("avatar_url" IS NOT NULL);



CREATE INDEX "idx_users_bio_text_search" ON "public"."users" USING "gin" ("to_tsvector"('"english"'::"regconfig", COALESCE("bio", ''::"text")));



CREATE INDEX "idx_users_coach" ON "public"."users" USING "btree" ("coach_id");



CREATE INDEX "idx_users_coach_id" ON "public"."users" USING "btree" ("coach_id");



CREATE INDEX "idx_users_dob" ON "public"."users" USING "btree" ("date_of_birth") WHERE ("date_of_birth" IS NOT NULL);



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_email_lookup" ON "public"."users" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_users_first_name" ON "public"."users" USING "btree" ("first_name");



CREATE INDEX "idx_users_full_name" ON "public"."users" USING "btree" ("full_name");



CREATE INDEX "idx_users_last_activity" ON "public"."users" USING "btree" ("last_activity_at");



CREATE INDEX "idx_users_last_name" ON "public"."users" USING "btree" ("last_name");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_role_lookup" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



CREATE INDEX "idx_workout_assignments_assigned_to_group" ON "public"."workout_assignments" USING "btree" ("assigned_to_group_id");



CREATE INDEX "idx_workout_assignments_assigned_to_user" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id");



CREATE INDEX "idx_workout_assignments_assignment_type" ON "public"."workout_assignments" USING "btree" ("assignment_type");



CREATE INDEX "idx_workout_assignments_athlete_ids" ON "public"."workout_assignments" USING "gin" ("athlete_ids");



CREATE INDEX "idx_workout_assignments_date" ON "public"."workout_assignments" USING "btree" ("scheduled_date");



CREATE INDEX "idx_workout_assignments_status" ON "public"."workout_assignments" USING "btree" ("status");



CREATE INDEX "idx_workout_block_instances_source_block" ON "public"."workout_block_instances" USING "btree" ("source_block_id");



CREATE INDEX "idx_workout_block_instances_workout_plan" ON "public"."workout_block_instances" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_blocks_category" ON "public"."workout_blocks" USING "btree" ("category");



CREATE INDEX "idx_workout_blocks_created_by" ON "public"."workout_blocks" USING "btree" ("created_by");



CREATE INDEX "idx_workout_blocks_is_favorite" ON "public"."workout_blocks" USING "btree" ("is_favorite");



CREATE INDEX "idx_workout_blocks_is_template" ON "public"."workout_blocks" USING "btree" ("is_template");



CREATE INDEX "idx_workout_blocks_last_used" ON "public"."workout_blocks" USING "btree" ("last_used" DESC NULLS LAST);



CREATE INDEX "idx_workout_blocks_tags" ON "public"."workout_blocks" USING "gin" ("tags");



CREATE INDEX "idx_workout_blocks_usage_count" ON "public"."workout_blocks" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_workout_exercise_groups_order" ON "public"."workout_exercise_groups" USING "btree" ("workout_plan_id", "order_index");



CREATE INDEX "idx_workout_exercise_groups_workout_plan" ON "public"."workout_exercise_groups" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_exercises_block_instance" ON "public"."workout_exercises" USING "btree" ("block_instance_id") WHERE ("block_instance_id" IS NOT NULL);



CREATE INDEX "idx_workout_exercises_group_id" ON "public"."workout_exercises" USING "btree" ("group_id") WHERE ("group_id" IS NOT NULL);



CREATE INDEX "idx_workout_exercises_group_order" ON "public"."workout_exercises" USING "btree" ("group_id", "order_index") WHERE ("group_id" IS NOT NULL);



CREATE INDEX "idx_workout_exercises_plan_id" ON "public"."workout_exercises" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_exercises_plan_order" ON "public"."workout_exercises" USING "btree" ("workout_plan_id", "order_index");



CREATE INDEX "idx_workout_exercises_video_url" ON "public"."workout_exercises" USING "btree" ("video_url") WHERE ("video_url" IS NOT NULL);



CREATE INDEX "idx_workout_exercises_workout_plan" ON "public"."workout_exercises" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_groups_block_instance" ON "public"."workout_exercise_groups" USING "btree" ("block_instance_id") WHERE ("block_instance_id" IS NOT NULL);



CREATE INDEX "idx_workout_groups_plan_id" ON "public"."workout_exercise_groups" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_groups_plan_order" ON "public"."workout_exercise_groups" USING "btree" ("workout_plan_id", "order_index");



CREATE INDEX "idx_workout_plans_archived" ON "public"."workout_plans" USING "btree" ("archived");



CREATE INDEX "idx_workout_plans_block_ids" ON "public"."workout_plans" USING "gin" ("block_ids");



CREATE INDEX "idx_workout_plans_block_instances" ON "public"."workout_plans" USING "gin" ("block_instances");



CREATE INDEX "idx_workout_plans_created_at" ON "public"."workout_plans" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_workout_plans_created_by" ON "public"."workout_plans" USING "btree" ("created_by");



CREATE INDEX "idx_workout_plans_created_by_date" ON "public"."workout_plans" USING "btree" ("created_by", "created_at" DESC);



CREATE INDEX "idx_workout_plans_name" ON "public"."workout_plans" USING "btree" ("name");



CREATE INDEX "idx_workout_plans_target_group" ON "public"."workout_plans" USING "btree" ("target_group_id");



CREATE INDEX "idx_workout_session_feedback_created_at" ON "public"."workout_session_feedback" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_workout_session_feedback_session_id" ON "public"."workout_session_feedback" USING "btree" ("session_id");



CREATE INDEX "idx_workout_session_feedback_user_id" ON "public"."workout_session_feedback" USING "btree" ("user_id");



CREATE INDEX "idx_workout_sessions_date" ON "public"."workout_sessions" USING "btree" ("date");



CREATE INDEX "idx_workout_sessions_user_id" ON "public"."workout_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "audit_invites_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."invites" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "audit_users_changes" AFTER DELETE OR UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "audit_workout_plans_changes" AFTER DELETE ON "public"."workout_plans" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "create_communication_preferences_for_new_user" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_communication_preferences"();



CREATE OR REPLACE TRIGGER "trigger_auto_assign_group_kpis" AFTER INSERT OR UPDATE OF "group_ids" ON "public"."users" FOR EACH ROW WHEN (("new"."role" = 'athlete'::"public"."user_role")) EXECUTE FUNCTION "public"."auto_assign_group_kpis"();



COMMENT ON TRIGGER "trigger_auto_assign_group_kpis" ON "public"."users" IS 'Triggers group KPI inheritance when athlete joins a group';



CREATE OR REPLACE TRIGGER "trigger_create_default_notification_preferences" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_notification_preferences"();



CREATE OR REPLACE TRIGGER "trigger_set_coach_responded_at" BEFORE UPDATE ON "public"."workout_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."set_coach_responded_at"();



CREATE OR REPLACE TRIGGER "trigger_update_feedback_timestamp" BEFORE UPDATE ON "public"."workout_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_feedback_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_preferences_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_users_timestamp" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_updated_at"();



CREATE OR REPLACE TRIGGER "update_athlete_assigned_kpis_timestamp" BEFORE UPDATE ON "public"."athlete_assigned_kpis" FOR EACH ROW EXECUTE FUNCTION "public"."update_athlete_assigned_kpis_updated_at"();



CREATE OR REPLACE TRIGGER "update_athlete_groups_updated_at" BEFORE UPDATE ON "public"."athlete_groups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_athlete_kpis_updated_at" BEFORE UPDATE ON "public"."athlete_kpis" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_communication_preferences_updated_at" BEFORE UPDATE ON "public"."communication_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invites_updated_at" BEFORE UPDATE ON "public"."invites" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_last_activity_on_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_last_activity"();



CREATE OR REPLACE TRIGGER "update_last_activity_on_session" AFTER INSERT ON "public"."workout_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_last_activity"();



CREATE OR REPLACE TRIGGER "update_messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_assignments_updated_at" BEFORE UPDATE ON "public"."workout_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_block_instances_updated_at" BEFORE UPDATE ON "public"."workout_block_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_blocks_updated_at" BEFORE UPDATE ON "public"."workout_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_plans_updated_at" BEFORE UPDATE ON "public"."workout_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workout_session_feedback_timestamp" BEFORE UPDATE ON "public"."workout_session_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_workout_session_feedback_updated_at"();



CREATE OR REPLACE TRIGGER "workout_blocks_updated_at" BEFORE UPDATE ON "public"."workout_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_workout_blocks_updated_at"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."athlete_achievements"
    ADD CONSTRAINT "athlete_achievements_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."athlete_assigned_kpis"
    ADD CONSTRAINT "athlete_assigned_kpis_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."athlete_assigned_kpis"
    ADD CONSTRAINT "athlete_assigned_kpis_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."athlete_assigned_kpis"
    ADD CONSTRAINT "athlete_assigned_kpis_kpi_tag_id_fkey" FOREIGN KEY ("kpi_tag_id") REFERENCES "public"."kpi_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."athlete_audit_log"
    ADD CONSTRAINT "athlete_audit_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."athlete_groups"
    ADD CONSTRAINT "athlete_groups_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."athlete_kpis"
    ADD CONSTRAINT "athlete_kpis_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."audit_trail"
    ADD CONSTRAINT "audit_trail_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."block_exercise_groups"
    ADD CONSTRAINT "block_exercise_groups_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."block_exercises"
    ADD CONSTRAINT "block_exercises_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bulk_operations"
    ADD CONSTRAINT "bulk_operations_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."coach_program_settings"
    ADD CONSTRAINT "coach_program_settings_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communication_preferences"
    ADD CONSTRAINT "communication_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."exercise_analytics"
    ADD CONSTRAINT "exercise_analytics_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_kpi_tags"
    ADD CONSTRAINT "exercise_kpi_tags_kpi_tag_id_fkey" FOREIGN KEY ("kpi_tag_id") REFERENCES "public"."kpi_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_kpi_tags"
    ADD CONSTRAINT "exercise_kpi_tags_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_muscle_groups"
    ADD CONSTRAINT "exercise_muscle_groups_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_muscle_groups"
    ADD CONSTRAINT "exercise_muscle_groups_muscle_group_id_fkey" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id");



ALTER TABLE ONLY "public"."exercise_variations"
    ADD CONSTRAINT "exercise_variations_parent_exercise_id_fkey" FOREIGN KEY ("parent_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_variations"
    ADD CONSTRAINT "exercise_variations_variation_exercise_id_fkey" FOREIGN KEY ("variation_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."exercise_categories"("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."in_app_notifications"
    ADD CONSTRAINT "in_app_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_audit_log"
    ADD CONSTRAINT "invite_audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invite_audit_log"
    ADD CONSTRAINT "invite_audit_log_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_audit_log"
    ADD CONSTRAINT "invite_audit_log_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."kpi_tags"
    ADD CONSTRAINT "kpi_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notification_log"
    ADD CONSTRAINT "notification_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."progress_analytics"
    ADD CONSTRAINT "progress_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."progress_entries"
    ADD CONSTRAINT "progress_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."workout_exercise_groups"("id");



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id");



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."set_records"
    ADD CONSTRAINT "set_records_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tos_versions"
    ADD CONSTRAINT "tos_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_exercise_preferences"
    ADD CONSTRAINT "user_exercise_preferences_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_exercise_preferences"
    ADD CONSTRAINT "user_exercise_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workout_assignments"
    ADD CONSTRAINT "workout_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_assignments"
    ADD CONSTRAINT "workout_assignments_assigned_to_group_id_fkey" FOREIGN KEY ("assigned_to_group_id") REFERENCES "public"."athlete_groups"("id");



ALTER TABLE ONLY "public"."workout_assignments"
    ADD CONSTRAINT "workout_assignments_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_assignments"
    ADD CONSTRAINT "workout_assignments_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id");



ALTER TABLE ONLY "public"."workout_block_instances"
    ADD CONSTRAINT "workout_block_instances_source_block_id_fkey" FOREIGN KEY ("source_block_id") REFERENCES "public"."workout_blocks"("id");



ALTER TABLE ONLY "public"."workout_block_instances"
    ADD CONSTRAINT "workout_block_instances_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_blocks"
    ADD CONSTRAINT "workout_blocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_exercise_groups"
    ADD CONSTRAINT "workout_exercise_groups_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_feedback"
    ADD CONSTRAINT "workout_feedback_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_feedback"
    ADD CONSTRAINT "workout_feedback_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_target_group_id_fkey" FOREIGN KEY ("target_group_id") REFERENCES "public"."athlete_groups"("id");



ALTER TABLE ONLY "public"."workout_session_feedback"
    ADD CONSTRAINT "workout_session_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_session_feedback"
    ADD CONSTRAINT "workout_session_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id");



CREATE POLICY "Admins can manage all blocks" ON "public"."workout_blocks" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all audit logs" ON "public"."athlete_audit_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all audit logs" ON "public"."audit_trail" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins have full access to feedback" ON "public"."workout_feedback" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Allow all KPIs operations" ON "public"."athlete_kpis" TO "authenticated" USING (true);



CREATE POLICY "Allow all groups operations" ON "public"."athlete_groups" TO "authenticated" USING (true);



CREATE POLICY "Allow all progress entries operations" ON "public"."progress_entries" TO "authenticated" USING (true);



CREATE POLICY "Allow all session exercises operations" ON "public"."session_exercises" TO "authenticated" USING (true);



CREATE POLICY "Allow all set records operations" ON "public"."set_records" TO "authenticated" USING (true);



CREATE POLICY "Allow all users operations" ON "public"."users" TO "authenticated" USING (true);



CREATE POLICY "Allow all workout assignments operations" ON "public"."workout_assignments" TO "authenticated" USING (true);



CREATE POLICY "Allow all workout exercises operations" ON "public"."workout_exercises" TO "authenticated" USING (true);



CREATE POLICY "Allow all workout plans operations" ON "public"."workout_plans" TO "authenticated" USING (true);



CREATE POLICY "Allow all workout sessions operations" ON "public"."workout_sessions" TO "authenticated" USING (true);



CREATE POLICY "Athletes can create own feedback" ON "public"."workout_feedback" FOR INSERT WITH CHECK (("auth"."uid"() = "athlete_id"));



CREATE POLICY "Athletes can insert own feedback" ON "public"."workout_session_feedback" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Athletes can update own feedback" ON "public"."workout_session_feedback" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Athletes can update own unviewed feedback" ON "public"."workout_feedback" FOR UPDATE USING ((("auth"."uid"() = "athlete_id") AND ("coach_viewed" = false))) WITH CHECK ((("auth"."uid"() = "athlete_id") AND ("coach_viewed" = false)));



CREATE POLICY "Athletes can view own achievements" ON "public"."athlete_achievements" FOR SELECT USING (("athlete_id" = "auth"."uid"()));



CREATE POLICY "Athletes can view own feedback" ON "public"."workout_feedback" FOR SELECT USING (("auth"."uid"() = "athlete_id"));



CREATE POLICY "Athletes can view own feedback" ON "public"."workout_session_feedback" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Categories readable by authenticated users" ON "public"."exercise_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Coaches can create invites" ON "public"."invites" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'coach'::"public"."user_role"]))))));



CREATE POLICY "Coaches can insert own settings" ON "public"."coach_program_settings" FOR INSERT WITH CHECK ((("auth"."uid"() = "coach_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role" = 'coach'::"public"."user_role") OR ("users"."role" = 'admin'::"public"."user_role")))))));



CREATE POLICY "Coaches can manage bulk operations" ON "public"."bulk_operations" USING ((("performed_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "Coaches can message their athletes" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "messages"."recipient_id") AND ("users"."coach_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."users" "sender"
     JOIN "public"."users" "recipient" ON (("recipient"."id" = "messages"."recipient_id")))
  WHERE (("sender"."id" = "auth"."uid"()) AND ("sender"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND ("recipient"."role" = 'athlete'::"public"."user_role")))))));



CREATE POLICY "Coaches can respond to feedback" ON "public"."workout_feedback" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can update own settings" ON "public"."coach_program_settings" FOR UPDATE USING ((("auth"."uid"() = "coach_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role" = 'coach'::"public"."user_role") OR ("users"."role" = 'admin'::"public"."user_role")))))));



CREATE POLICY "Coaches can view all achievements" ON "public"."athlete_achievements" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all blocks" ON "public"."workout_blocks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all feedback" ON "public"."workout_session_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all notifications" ON "public"."in_app_notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all notifications" ON "public"."notification_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all preferences" ON "public"."notification_preferences" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view all subscriptions" ON "public"."push_subscriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view athlete activity" ON "public"."activity_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "coach"
     JOIN "public"."users" "athlete" ON (("athlete"."id" = "activity_log"."user_id")))
  WHERE (("coach"."id" = "auth"."uid"()) AND ("coach"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND (("athlete"."coach_id" = "auth"."uid"()) OR ("athlete"."role" = 'athlete'::"public"."user_role"))))));



CREATE POLICY "Coaches can view athlete feedback" ON "public"."workout_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Coaches can view athlete progress analytics" ON "public"."progress_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "coach"
     JOIN "public"."users" "athlete" ON (("athlete"."id" = "progress_analytics"."user_id")))
  WHERE (("coach"."id" = "auth"."uid"()) AND ("coach"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND (("athlete"."coach_id" = "auth"."uid"()) OR ("athlete"."role" = 'athlete'::"public"."user_role"))))));



CREATE POLICY "Coaches can view own settings" ON "public"."coach_program_settings" FOR SELECT USING ((("auth"."uid"() = "coach_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role" = 'coach'::"public"."user_role") OR ("users"."role" = 'admin'::"public"."user_role")))))));



CREATE POLICY "Coaches can view their invite audit logs" ON "public"."invite_audit_log" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_audit_log"."invite_id") AND ("invites"."invited_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'coach'::"public"."user_role"])))))));



CREATE POLICY "Coaches can view their own audit logs" ON "public"."audit_trail" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND (("audit_trail"."performed_by" = "auth"."uid"()) OR ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Coaches can view their own invites" ON "public"."invites" FOR SELECT USING ((("invited_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'coach'::"public"."user_role"])))))));



CREATE POLICY "Equipment types readable by authenticated users" ON "public"."equipment_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Exercise analytics readable by coaches" ON "public"."exercise_analytics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Exercise muscle groups manageable by coaches" ON "public"."exercise_muscle_groups" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Exercise muscle groups readable" ON "public"."exercise_muscle_groups" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."exercises"
  WHERE (("exercises"."id" = "exercise_muscle_groups"."exercise_id") AND (("exercises"."is_active" = true) OR ("exercises"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Exercise variations manageable by coaches" ON "public"."exercise_variations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Exercise variations readable" ON "public"."exercise_variations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Exercises manageable by coaches and admins" ON "public"."exercises" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Exercises readable by authenticated users" ON "public"."exercises" FOR SELECT TO "authenticated" USING ((("is_active" = true) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Muscle groups readable by authenticated users" ON "public"."muscle_groups" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Only coaches can access invites" ON "public"."invites" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Service role can insert users" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert achievements" ON "public"."athlete_achievements" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert audit logs" ON "public"."invite_audit_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."in_app_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."notification_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can update notifications" ON "public"."notification_log" FOR UPDATE USING (true);



CREATE POLICY "User preferences private" ON "public"."user_exercise_preferences" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create own blocks" ON "public"."workout_blocks" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete own blocks" ON "public"."workout_blocks" FOR DELETE USING ((("auth"."uid"() = "created_by") AND ("is_template" = false)));



CREATE POLICY "Users can delete own notifications" ON "public"."in_app_notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own subscriptions" ON "public"."push_subscriptions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own preferences" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own subscriptions" ON "public"."push_subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own communication preferences" ON "public"."communication_preferences" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own notifications" ON "public"."notifications" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can send and receive messages" ON "public"."messages" USING ((("sender_id" = "auth"."uid"()) OR ("recipient_id" = "auth"."uid"())));



CREATE POLICY "Users can update own blocks" ON "public"."workout_blocks" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update own notifications" ON "public"."in_app_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own preferences" ON "public"."notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own subscriptions" ON "public"."push_subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own invitation" ON "public"."invites" FOR UPDATE USING (("email" = "auth"."email"())) WITH CHECK (("email" = "auth"."email"()));



CREATE POLICY "Users can view invitations sent to their email" ON "public"."invites" FOR SELECT USING (("email" = "auth"."email"()));



CREATE POLICY "Users can view own activity" ON "public"."activity_log" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own blocks" ON "public"."workout_blocks" FOR SELECT USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can view own notifications" ON "public"."in_app_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notification_log" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own preferences" ON "public"."notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own progress analytics" ON "public"."progress_analytics" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own subscriptions" ON "public"."push_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view template blocks" ON "public"."workout_blocks" FOR SELECT USING (("is_template" = true));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."athlete_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."athlete_assigned_kpis" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "athlete_assigned_kpis_delete_coach" ON "public"."athlete_assigned_kpis" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "athlete_assigned_kpis_insert_coach" ON "public"."athlete_assigned_kpis" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "athlete_assigned_kpis_select_own" ON "public"."athlete_assigned_kpis" FOR SELECT USING ((("athlete_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "athlete_assigned_kpis_update_coach" ON "public"."athlete_assigned_kpis" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



ALTER TABLE "public"."athlete_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."athlete_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."athlete_kpis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_trail" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."block_exercise_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "block_exercise_groups_delete" ON "public"."block_exercise_groups" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercise_groups"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



CREATE POLICY "block_exercise_groups_insert" ON "public"."block_exercise_groups" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercise_groups"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



CREATE POLICY "block_exercise_groups_select" ON "public"."block_exercise_groups" FOR SELECT USING (true);



CREATE POLICY "block_exercise_groups_update" ON "public"."block_exercise_groups" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercise_groups"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



ALTER TABLE "public"."block_exercises" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "block_exercises_delete" ON "public"."block_exercises" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercises"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



CREATE POLICY "block_exercises_insert" ON "public"."block_exercises" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercises"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



CREATE POLICY "block_exercises_select" ON "public"."block_exercises" FOR SELECT USING (true);



CREATE POLICY "block_exercises_update" ON "public"."block_exercises" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_blocks" "wb"
  WHERE (("wb"."id" = "block_exercises"."block_id") AND ("wb"."created_by" = "auth"."uid"())))));



ALTER TABLE "public"."bulk_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coach_program_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communication_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_kpi_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exercise_kpi_tags_delete_coach" ON "public"."exercise_kpi_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "exercise_kpi_tags_insert_coach" ON "public"."exercise_kpi_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "exercise_kpi_tags_select_own" ON "public"."exercise_kpi_tags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."workout_exercises" "we"
     JOIN "public"."workout_plans" "wp" ON (("we"."workout_plan_id" = "wp"."id")))
  WHERE (("we"."id" = "exercise_kpi_tags"."workout_exercise_id") AND (("wp"."created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."workout_assignments" "wa"
          WHERE (("wa"."workout_plan_id" = "wp"."id") AND ("wa"."assigned_to_user_id" = "auth"."uid"())))))))));



CREATE POLICY "exercise_kpi_tags_update_coach" ON "public"."exercise_kpi_tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



ALTER TABLE "public"."exercise_muscle_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_variations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."in_app_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invite_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kpi_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "kpi_tags_delete_coach" ON "public"."kpi_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "kpi_tags_insert_coach" ON "public"."kpi_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "kpi_tags_select_all" ON "public"."kpi_tags" FOR SELECT USING (true);



CREATE POLICY "kpi_tags_update_coach" ON "public"."kpi_tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"]))))));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."muscle_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progress_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progress_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."set_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_exercise_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_block_instances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workout_block_instances_delete" ON "public"."workout_block_instances" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_block_instances"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_block_instances_delete_policy" ON "public"."workout_block_instances" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_block_instances"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_block_instances_insert" ON "public"."workout_block_instances" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_block_instances"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_block_instances_insert_policy" ON "public"."workout_block_instances" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_block_instances"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_block_instances_select" ON "public"."workout_block_instances" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE ("wp"."id" = "workout_block_instances"."workout_plan_id"))));



CREATE POLICY "workout_block_instances_select_policy" ON "public"."workout_block_instances" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE ("workout_plans"."id" = "workout_block_instances"."workout_plan_id"))));



CREATE POLICY "workout_block_instances_update" ON "public"."workout_block_instances" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_block_instances"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_block_instances_update_policy" ON "public"."workout_block_instances" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_block_instances"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



ALTER TABLE "public"."workout_blocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workout_blocks_delete" ON "public"."workout_blocks" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "workout_blocks_insert" ON "public"."workout_blocks" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "workout_blocks_select" ON "public"."workout_blocks" FOR SELECT USING (true);



CREATE POLICY "workout_blocks_update" ON "public"."workout_blocks" FOR UPDATE USING (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."workout_exercise_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workout_exercise_groups_delete" ON "public"."workout_exercise_groups" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_exercise_groups"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_exercise_groups_delete_policy" ON "public"."workout_exercise_groups" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_exercise_groups"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_exercise_groups_insert" ON "public"."workout_exercise_groups" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_exercise_groups"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_exercise_groups_insert_policy" ON "public"."workout_exercise_groups" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_exercise_groups"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_exercise_groups_select" ON "public"."workout_exercise_groups" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE ("wp"."id" = "workout_exercise_groups"."workout_plan_id"))));



CREATE POLICY "workout_exercise_groups_select_policy" ON "public"."workout_exercise_groups" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE ("workout_plans"."id" = "workout_exercise_groups"."workout_plan_id"))));



CREATE POLICY "workout_exercise_groups_update" ON "public"."workout_exercise_groups" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans" "wp"
  WHERE (("wp"."id" = "workout_exercise_groups"."workout_plan_id") AND ("wp"."created_by" = "auth"."uid"())))));



CREATE POLICY "workout_exercise_groups_update_policy" ON "public"."workout_exercise_groups" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workout_plans"
  WHERE (("workout_plans"."id" = "workout_exercise_groups"."workout_plan_id") AND ("workout_plans"."created_by" = "auth"."uid"())))));



ALTER TABLE "public"."workout_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_session_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_sessions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_assign_group_kpis"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_assign_group_kpis"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_assign_group_kpis"() TO "service_role";



GRANT ALL ON FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text", "p_target_value" numeric, "p_target_date" "date", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text", "p_target_value" numeric, "p_target_date" "date", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bulk_assign_kpis"("p_athlete_ids" "uuid"[], "p_kpi_tag_ids" "uuid"[], "p_assigned_by" "uuid", "p_assigned_via" "text", "p_target_value" numeric, "p_target_date" "date", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_age"("birth_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_age"("birth_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_age"("birth_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_bmi"("height_in" numeric, "weight_lb" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_bmi"("height_in" numeric, "weight_lb" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_bmi"("height_in" numeric, "weight_lb" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_communication_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_communication_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_communication_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_in_app_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_body" "text", "p_icon" "text", "p_url" "text", "p_priority" "text", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_in_app_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_body" "text", "p_icon" "text", "p_url" "text", "p_priority" "text", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_in_app_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_body" "text", "p_icon" "text", "p_url" "text", "p_priority" "text", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_workout_plan_transaction"("p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_created_by" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_deletion_history"("p_table_name" "text", "p_record_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_deletion_history"("p_table_name" "text", "p_record_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_deletion_history"("p_table_name" "text", "p_record_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_exercises_with_details"("category_filter" "uuid", "muscle_group_filter" "text", "equipment_filter" "text", "difficulty_filter" integer, "search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_exercises_with_details"("category_filter" "uuid", "muscle_group_filter" "text", "equipment_filter" "text", "difficulty_filter" integer, "search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_exercises_with_details"("category_filter" "uuid", "muscle_group_filter" "text", "equipment_filter" "text", "difficulty_filter" integer, "search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_message_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hard_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text", "confirmation_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_athlete"("athlete_id" "uuid", "restored_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_deleted_invite"("invite_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_deleted_invite"("invite_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_deleted_invite"("invite_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_coach_responded_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_coach_responded_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_coach_responded_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_athlete"("athlete_id" "uuid", "deleted_by" "uuid", "deletion_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_athlete_assigned_kpis_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_athlete_assigned_kpis_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_athlete_assigned_kpis_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_last_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_last_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_last_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_workout_blocks_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_workout_blocks_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_workout_blocks_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_workout_plan_transaction"("p_plan_id" "uuid", "p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_workout_plan_transaction"("p_plan_id" "uuid", "p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_workout_plan_transaction"("p_plan_id" "uuid", "p_name" "text", "p_description" "text", "p_estimated_duration" integer, "p_target_group_id" "uuid", "p_archived" boolean, "p_exercises" "jsonb", "p_groups" "jsonb", "p_block_instances" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_workout_session_feedback_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_workout_session_feedback_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_workout_session_feedback_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."athlete_assigned_kpis" TO "anon";
GRANT ALL ON TABLE "public"."athlete_assigned_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_assigned_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."kpi_tags" TO "anon";
GRANT ALL ON TABLE "public"."kpi_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."kpi_tags" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."active_athlete_kpis" TO "anon";
GRANT ALL ON TABLE "public"."active_athlete_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."active_athlete_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."active_athletes" TO "anon";
GRANT ALL ON TABLE "public"."active_athletes" TO "authenticated";
GRANT ALL ON TABLE "public"."active_athletes" TO "service_role";



GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_achievements" TO "anon";
GRANT ALL ON TABLE "public"."athlete_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."athlete_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."workout_feedback" TO "anon";
GRANT ALL ON TABLE "public"."workout_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_feedback_summary" TO "anon";
GRANT ALL ON TABLE "public"."athlete_feedback_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_feedback_summary" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_groups" TO "anon";
GRANT ALL ON TABLE "public"."athlete_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_groups" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_kpi_tags" TO "anon";
GRANT ALL ON TABLE "public"."exercise_kpi_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_kpi_tags" TO "service_role";



GRANT ALL ON TABLE "public"."session_exercises" TO "anon";
GRANT ALL ON TABLE "public"."session_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."session_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."set_records" TO "anon";
GRANT ALL ON TABLE "public"."set_records" TO "authenticated";
GRANT ALL ON TABLE "public"."set_records" TO "service_role";



GRANT ALL ON TABLE "public"."workout_assignments" TO "anon";
GRANT ALL ON TABLE "public"."workout_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercises" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."workout_plans" TO "anon";
GRANT ALL ON TABLE "public"."workout_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_plans" TO "service_role";



GRANT ALL ON TABLE "public"."workout_sessions" TO "anon";
GRANT ALL ON TABLE "public"."workout_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_kpi_exercise_history" TO "anon";
GRANT ALL ON TABLE "public"."athlete_kpi_exercise_history" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_kpi_exercise_history" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_kpi_summary" TO "anon";
GRANT ALL ON TABLE "public"."athlete_kpi_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_kpi_summary" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_kpis" TO "anon";
GRANT ALL ON TABLE "public"."athlete_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."audit_trail" TO "anon";
GRANT ALL ON TABLE "public"."audit_trail" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_trail" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log_summary" TO "anon";
GRANT ALL ON TABLE "public"."audit_log_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log_summary" TO "service_role";



GRANT ALL ON TABLE "public"."block_exercise_groups" TO "anon";
GRANT ALL ON TABLE "public"."block_exercise_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."block_exercise_groups" TO "service_role";



GRANT ALL ON TABLE "public"."block_exercises" TO "anon";
GRANT ALL ON TABLE "public"."block_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."block_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."bulk_operations" TO "anon";
GRANT ALL ON TABLE "public"."bulk_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."bulk_operations" TO "service_role";



GRANT ALL ON TABLE "public"."coach_program_settings" TO "anon";
GRANT ALL ON TABLE "public"."coach_program_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_program_settings" TO "service_role";



GRANT ALL ON TABLE "public"."coach_unread_feedback" TO "anon";
GRANT ALL ON TABLE "public"."coach_unread_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_unread_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."communication_preferences" TO "anon";
GRANT ALL ON TABLE "public"."communication_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."deleted_athletes" TO "anon";
GRANT ALL ON TABLE "public"."deleted_athletes" TO "authenticated";
GRANT ALL ON TABLE "public"."deleted_athletes" TO "service_role";



GRANT ALL ON TABLE "public"."equipment_types" TO "anon";
GRANT ALL ON TABLE "public"."equipment_types" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment_types" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_analytics" TO "anon";
GRANT ALL ON TABLE "public"."exercise_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_categories" TO "anon";
GRANT ALL ON TABLE "public"."exercise_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_categories" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_muscle_groups" TO "anon";
GRANT ALL ON TABLE "public"."exercise_muscle_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_muscle_groups" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_variations" TO "anon";
GRANT ALL ON TABLE "public"."exercise_variations" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_variations" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."in_app_notifications" TO "anon";
GRANT ALL ON TABLE "public"."in_app_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."in_app_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."invite_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."invite_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";



GRANT ALL ON TABLE "public"."kpi_tag_volume_summary" TO "anon";
GRANT ALL ON TABLE "public"."kpi_tag_volume_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."kpi_tag_volume_summary" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."muscle_groups" TO "anon";
GRANT ALL ON TABLE "public"."muscle_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."muscle_groups" TO "service_role";



GRANT ALL ON TABLE "public"."notification_log" TO "anon";
GRANT ALL ON TABLE "public"."notification_log" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_log" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notification_stats" TO "anon";
GRANT ALL ON TABLE "public"."notification_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_stats" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."progress_analytics" TO "anon";
GRANT ALL ON TABLE "public"."progress_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."progress_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."progress_entries" TO "anon";
GRANT ALL ON TABLE "public"."progress_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."progress_entries" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."tos_versions" TO "anon";
GRANT ALL ON TABLE "public"."tos_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."tos_versions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tos_versions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tos_versions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tos_versions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_notification_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_summary" TO "service_role";



GRANT ALL ON TABLE "public"."users_with_metrics" TO "anon";
GRANT ALL ON TABLE "public"."users_with_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."users_with_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."workout_block_instances" TO "anon";
GRANT ALL ON TABLE "public"."workout_block_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_block_instances" TO "service_role";



GRANT ALL ON TABLE "public"."workout_blocks" TO "anon";
GRANT ALL ON TABLE "public"."workout_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "service_role";



GRANT ALL ON TABLE "public"."workout_session_feedback" TO "anon";
GRANT ALL ON TABLE "public"."workout_session_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_session_feedback" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







RESET ALL;
A new version of Supabase CLI is available: v2.58.5 (currently installed v2.51.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
