Initialising login role...
Dumping schemas from remote database...
17.6.1.031: Pulling from supabase/postgres
a990654f713c: Pulling fs layer
77020bb9e1e3: Pulling fs layer
4f4fb700ef54: Pulling fs layer
d544f141acdd: Pulling fs layer
3d5382589c9d: Pulling fs layer
ac13eb8f2542: Pulling fs layer
a2e6921f52dd: Pulling fs layer
b8a35db46e38: Pulling fs layer
8516421a23ef: Pulling fs layer
24ef86775b84: Pulling fs layer
16ad5cc92e40: Pulling fs layer
374ff779b43a: Pulling fs layer
6a03575abc24: Pulling fs layer
ffc388e5e0a3: Pulling fs layer
07bb00c777cc: Pulling fs layer
4f4fb700ef54: Pulling fs layer
322102ef5f62: Pulling fs layer
5561635e80a8: Pulling fs layer
f20361773031: Pulling fs layer
0ef67446278a: Pulling fs layer
9a3884654ad1: Pulling fs layer
ad440a9e69a3: Pulling fs layer
11bed4e4b4e1: Pulling fs layer
df1bde91310f: Pulling fs layer
2e60b59ddd05: Pulling fs layer
57929c66b793: Pulling fs layer
c81e981421b6: Pulling fs layer
c47d6768f496: Pulling fs layer
f981126797ab: Pulling fs layer
864035e2b002: Pulling fs layer
c4484b6019d7: Pulling fs layer
56f1c4b774cb: Pulling fs layer
08f4c37b2bd0: Pulling fs layer
2f96abb4d1e5: Pulling fs layer
1c7c4254478a: Pulling fs layer
90ea0cf7a4a5: Pulling fs layer
b92f1676c8cc: Pulling fs layer
d1f82b8069d9: Pulling fs layer
5d3e3a8a424b: Pulling fs layer
2bcf824748d3: Pulling fs layer
292a3bd4e937: Pulling fs layer
3794ae28129c: Pulling fs layer
1529d040f745: Pulling fs layer
9521c02c43d9: Pulling fs layer
c0ff2ef382ca: Pulling fs layer
d3646845ad75: Pulling fs layer
0787626131f1: Pulling fs layer
710587d3d703: Pulling fs layer
996ad0cb94be: Pulling fs layer
d8e8d38ce849: Pulling fs layer
4f4fb700ef54: Pulling fs layer
e2a15aff3fc2: Pulling fs layer
4f4fb700ef54: Already exists
3d5382589c9d: Download complete
a990654f713c: Download complete
77020bb9e1e3: Download complete
8516421a23ef: Download complete
374ff779b43a: Download complete
2e60b59ddd05: Download complete
df1bde91310f: Download complete
292a3bd4e937: Download complete
0ef67446278a: Download complete
b92f1676c8cc: Download complete
f20361773031: Download complete
56f1c4b774cb: Download complete
11bed4e4b4e1: Download complete
a2e6921f52dd: Download complete
07bb00c777cc: Download complete
c47d6768f496: Download complete
08f4c37b2bd0: Download complete
9a3884654ad1: Download complete
5d3e3a8a424b: Download complete
d3646845ad75: Download complete
c4484b6019d7: Download complete
0787626131f1: Download complete
710587d3d703: Download complete
322102ef5f62: Download complete
2bcf824748d3: Download complete
c0ff2ef382ca: Download complete
ad440a9e69a3: Download complete
1c7c4254478a: Download complete
1529d040f745: Download complete
e2a15aff3fc2: Download complete
9521c02c43d9: Download complete
f981126797ab: Download complete
90ea0cf7a4a5: Download complete
ffc388e5e0a3: Download complete
d8e8d38ce849: Download complete
c81e981421b6: Download complete
24ef86775b84: Download complete
16ad5cc92e40: Download complete
d1f82b8069d9: Download complete
57929c66b793: Download complete
3794ae28129c: Download complete
2f96abb4d1e5: Download complete
6a03575abc24: Download complete
996ad0cb94be: Download complete
b8a35db46e38: Download complete
b8a35db46e38: Pull complete
864035e2b002: Download complete
5561635e80a8: Download complete
d544f141acdd: Download complete
d544f141acdd: Pull complete
3d5382589c9d: Pull complete
a990654f713c: Pull complete
864035e2b002: Pull complete
24ef86775b84: Pull complete
4f4fb700ef54: Pull complete
ac13eb8f2542: Download complete
ac13eb8f2542: Pull complete
77020bb9e1e3: Pull complete
57929c66b793: Pull complete
292a3bd4e937: Pull complete
6a03575abc24: Pull complete
2e60b59ddd05: Pull complete
df1bde91310f: Pull complete
0ef67446278a: Pull complete
56f1c4b774cb: Pull complete
322102ef5f62: Pull complete
ad440a9e69a3: Pull complete
c81e981421b6: Pull complete
996ad0cb94be: Pull complete
5561635e80a8: Pull complete
07bb00c777cc: Pull complete
ffc388e5e0a3: Pull complete
d8e8d38ce849: Pull complete
16ad5cc92e40: Pull complete
0787626131f1: Pull complete
710587d3d703: Pull complete
f981126797ab: Pull complete
90ea0cf7a4a5: Pull complete
2f96abb4d1e5: Pull complete
8516421a23ef: Pull complete
a2e6921f52dd: Pull complete
374ff779b43a: Pull complete
b92f1676c8cc: Pull complete
f20361773031: Pull complete
11bed4e4b4e1: Pull complete
c47d6768f496: Pull complete
08f4c37b2bd0: Pull complete
9a3884654ad1: Pull complete
d3646845ad75: Pull complete
2bcf824748d3: Pull complete
c0ff2ef382ca: Pull complete
1529d040f745: Pull complete
e2a15aff3fc2: Pull complete
9521c02c43d9: Pull complete
5d3e3a8a424b: Pull complete
1c7c4254478a: Pull complete
c4484b6019d7: Pull complete
d1f82b8069d9: Pull complete
3794ae28129c: Pull complete
Digest: sha256:11b10612ff108c31ff3e7ac62474c15be9f0d74196188ee4ed6e6f05ae25996f
Status: Downloaded newer image for public.ecr.aws/supabase/postgres:17.6.1.031



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

SET default_tablespace = '';

SET default_table_access_method = "heap";


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
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."session_exercises" OWNER TO "postgres";


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
    CONSTRAINT "assignment_target_check" CHECK (((("assigned_to_user_id" IS NOT NULL) AND ("assigned_to_group_id" IS NULL)) OR (("assigned_to_user_id" IS NULL) AND ("assigned_to_group_id" IS NOT NULL))))
);


ALTER TABLE "public"."workout_assignments" OWNER TO "postgres";


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
    "progression_notes" "text"
);


ALTER TABLE "public"."workout_exercises" OWNER TO "postgres";


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
    "block_instances" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."workout_plans" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workout_plans"."block_instances" IS 'Array of block instances used in this workout. Each instance has: id, sourceBlockId, sourceBlockName, instanceName (optional), customizations (tracking changes), notes, estimatedDuration, createdAt, updatedAt';



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


ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_groups"
    ADD CONSTRAINT "athlete_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."athlete_kpis"
    ADD CONSTRAINT "athlete_kpis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."block_exercise_groups"
    ADD CONSTRAINT "block_exercise_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."block_exercises"
    ADD CONSTRAINT "block_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_operations"
    ADD CONSTRAINT "bulk_operations_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_log_action_type" ON "public"."activity_log" USING "btree" ("action_type");



CREATE INDEX "idx_activity_log_user_created" ON "public"."activity_log" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_assignments_assigned_by" ON "public"."workout_assignments" USING "btree" ("assigned_by");



CREATE INDEX "idx_assignments_completed" ON "public"."workout_assignments" USING "btree" ("completed");



CREATE INDEX "idx_assignments_group_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_group_id", "scheduled_date");



CREATE INDEX "idx_assignments_user_completed_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id", "completed", "scheduled_date");



CREATE INDEX "idx_assignments_user_date" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id", "scheduled_date");



CREATE INDEX "idx_athlete_groups_archived" ON "public"."athlete_groups" USING "btree" ("archived");



CREATE INDEX "idx_athlete_groups_coach_id" ON "public"."athlete_groups" USING "btree" ("coach_id");



CREATE INDEX "idx_athlete_kpis_athlete_id" ON "public"."athlete_kpis" USING "btree" ("athlete_id");



CREATE INDEX "idx_block_exercise_groups_block_id" ON "public"."block_exercise_groups" USING "btree" ("block_id");



CREATE INDEX "idx_block_exercises_block_id" ON "public"."block_exercises" USING "btree" ("block_id");



CREATE INDEX "idx_bulk_operations_performed_by" ON "public"."bulk_operations" USING "btree" ("performed_by");



CREATE INDEX "idx_bulk_operations_status" ON "public"."bulk_operations" USING "btree" ("status");



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



CREATE INDEX "idx_groups_archived" ON "public"."athlete_groups" USING "btree" ("archived");



CREATE INDEX "idx_groups_coach" ON "public"."athlete_groups" USING "btree" ("coach_id");



CREATE INDEX "idx_in_app_notifs_created" ON "public"."in_app_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_in_app_notifs_expires" ON "public"."in_app_notifications" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_in_app_notifs_unread" ON "public"."in_app_notifications" USING "btree" ("user_id", "read") WHERE ("read" = false);



CREATE INDEX "idx_in_app_notifs_user_id" ON "public"."in_app_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_invites_email" ON "public"."invites" USING "btree" ("email");



CREATE INDEX "idx_invites_expires_at" ON "public"."invites" USING "btree" ("expires_at");



CREATE INDEX "idx_invites_first_name" ON "public"."invites" USING "btree" ("first_name");



CREATE INDEX "idx_invites_full_name" ON "public"."invites" USING "btree" ("full_name");



CREATE INDEX "idx_invites_group_ids" ON "public"."invites" USING "gin" ("group_ids");



CREATE INDEX "idx_invites_invited_by" ON "public"."invites" USING "btree" ("invited_by");



CREATE INDEX "idx_invites_last_name" ON "public"."invites" USING "btree" ("last_name");



CREATE INDEX "idx_invites_status" ON "public"."invites" USING "btree" ("status");



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



CREATE INDEX "idx_session_exercises_session_id" ON "public"."session_exercises" USING "btree" ("workout_session_id");



CREATE INDEX "idx_set_records_session_exercise" ON "public"."set_records" USING "btree" ("session_exercise_id");



CREATE INDEX "idx_user_preferences_exercise" ON "public"."user_exercise_preferences" USING "btree" ("exercise_id");



CREATE INDEX "idx_user_preferences_user" ON "public"."user_exercise_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_users_avatar_url" ON "public"."users" USING "btree" ("avatar_url") WHERE ("avatar_url" IS NOT NULL);



CREATE INDEX "idx_users_bio_text_search" ON "public"."users" USING "gin" ("to_tsvector"('"english"'::"regconfig", COALESCE("bio", ''::"text")));



CREATE INDEX "idx_users_coach" ON "public"."users" USING "btree" ("coach_id");



CREATE INDEX "idx_users_coach_id" ON "public"."users" USING "btree" ("coach_id");



CREATE INDEX "idx_users_dob" ON "public"."users" USING "btree" ("date_of_birth") WHERE ("date_of_birth" IS NOT NULL);



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_first_name" ON "public"."users" USING "btree" ("first_name");



CREATE INDEX "idx_users_full_name" ON "public"."users" USING "btree" ("full_name");



CREATE INDEX "idx_users_last_activity" ON "public"."users" USING "btree" ("last_activity_at");



CREATE INDEX "idx_users_last_name" ON "public"."users" USING "btree" ("last_name");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



CREATE INDEX "idx_workout_assignments_assigned_to_group" ON "public"."workout_assignments" USING "btree" ("assigned_to_group_id");



CREATE INDEX "idx_workout_assignments_assigned_to_user" ON "public"."workout_assignments" USING "btree" ("assigned_to_user_id");



CREATE INDEX "idx_workout_assignments_date" ON "public"."workout_assignments" USING "btree" ("scheduled_date");



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



CREATE INDEX "idx_workout_exercises_workout_plan" ON "public"."workout_exercises" USING "btree" ("workout_plan_id");



CREATE INDEX "idx_workout_plans_block_ids" ON "public"."workout_plans" USING "gin" ("block_ids");



CREATE INDEX "idx_workout_plans_block_instances" ON "public"."workout_plans" USING "gin" ("block_instances");



CREATE INDEX "idx_workout_plans_created_at" ON "public"."workout_plans" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_workout_plans_created_by" ON "public"."workout_plans" USING "btree" ("created_by");



CREATE INDEX "idx_workout_plans_created_by_date" ON "public"."workout_plans" USING "btree" ("created_by", "created_at" DESC);



CREATE INDEX "idx_workout_plans_name" ON "public"."workout_plans" USING "btree" ("name");



CREATE INDEX "idx_workout_plans_target_group" ON "public"."workout_plans" USING "btree" ("target_group_id");



CREATE INDEX "idx_workout_sessions_date" ON "public"."workout_sessions" USING "btree" ("date");



CREATE INDEX "idx_workout_sessions_user_id" ON "public"."workout_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "create_communication_preferences_for_new_user" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_communication_preferences"();



CREATE OR REPLACE TRIGGER "trigger_create_default_notification_preferences" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_notification_preferences"();



CREATE OR REPLACE TRIGGER "trigger_update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_preferences_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_users_timestamp" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_updated_at"();



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



CREATE OR REPLACE TRIGGER "workout_blocks_updated_at" BEFORE UPDATE ON "public"."workout_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_workout_blocks_updated_at"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."athlete_groups"
    ADD CONSTRAINT "athlete_groups_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."athlete_kpis"
    ADD CONSTRAINT "athlete_kpis_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."block_exercise_groups"
    ADD CONSTRAINT "block_exercise_groups_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."block_exercises"
    ADD CONSTRAINT "block_exercises_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bulk_operations"
    ADD CONSTRAINT "bulk_operations_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."communication_preferences"
    ADD CONSTRAINT "communication_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."exercise_analytics"
    ADD CONSTRAINT "exercise_analytics_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



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
    ADD CONSTRAINT "session_exercises_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id");



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."set_records"
    ADD CONSTRAINT "set_records_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_plans"
    ADD CONSTRAINT "workout_plans_target_group_id_fkey" FOREIGN KEY ("target_group_id") REFERENCES "public"."athlete_groups"("id");



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id");



CREATE POLICY "Admins can manage all blocks" ON "public"."workout_blocks" USING ((EXISTS ( SELECT 1
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



CREATE POLICY "Categories readable by authenticated users" ON "public"."exercise_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Coaches can create invites" ON "public"."invites" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'coach'::"public"."user_role"]))))));



CREATE POLICY "Coaches can manage bulk operations" ON "public"."bulk_operations" USING ((("performed_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "Coaches can message their athletes" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "messages"."recipient_id") AND ("users"."coach_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."users" "sender"
     JOIN "public"."users" "recipient" ON (("recipient"."id" = "messages"."recipient_id")))
  WHERE (("sender"."id" = "auth"."uid"()) AND ("sender"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND ("recipient"."role" = 'athlete'::"public"."user_role")))))));



CREATE POLICY "Coaches can view all blocks" ON "public"."workout_blocks" FOR SELECT USING ((EXISTS ( SELECT 1
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



CREATE POLICY "Coaches can view athlete progress analytics" ON "public"."progress_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "coach"
     JOIN "public"."users" "athlete" ON (("athlete"."id" = "progress_analytics"."user_id")))
  WHERE (("coach"."id" = "auth"."uid"()) AND ("coach"."role" = ANY (ARRAY['coach'::"public"."user_role", 'admin'::"public"."user_role"])) AND (("athlete"."coach_id" = "auth"."uid"()) OR ("athlete"."role" = 'athlete'::"public"."user_role"))))));



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



CREATE POLICY "Service role can insert users" ON "public"."users" FOR INSERT WITH CHECK (true);



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


ALTER TABLE "public"."athlete_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."athlete_kpis" ENABLE ROW LEVEL SECURITY;


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


ALTER TABLE "public"."communication_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_muscle_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_variations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."in_app_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;


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


ALTER TABLE "public"."workout_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workout_sessions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



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



GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_notifications"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_block_usage"("block_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_exercise_usage"("exercise_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_block_favorite"("block_id" "uuid", "user_id" "uuid") TO "service_role";



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



GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_groups" TO "anon";
GRANT ALL ON TABLE "public"."athlete_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_groups" TO "service_role";



GRANT ALL ON TABLE "public"."athlete_kpis" TO "anon";
GRANT ALL ON TABLE "public"."athlete_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."block_exercise_groups" TO "anon";
GRANT ALL ON TABLE "public"."block_exercise_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."block_exercise_groups" TO "service_role";



GRANT ALL ON TABLE "public"."block_exercises" TO "anon";
GRANT ALL ON TABLE "public"."block_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."block_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."bulk_operations" TO "anon";
GRANT ALL ON TABLE "public"."bulk_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."bulk_operations" TO "service_role";



GRANT ALL ON TABLE "public"."communication_preferences" TO "anon";
GRANT ALL ON TABLE "public"."communication_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_preferences" TO "service_role";



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



GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";



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



GRANT ALL ON TABLE "public"."session_exercises" TO "anon";
GRANT ALL ON TABLE "public"."session_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."session_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."set_records" TO "anon";
GRANT ALL ON TABLE "public"."set_records" TO "authenticated";
GRANT ALL ON TABLE "public"."set_records" TO "service_role";



GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_exercise_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."user_notification_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_summary" TO "service_role";



GRANT ALL ON TABLE "public"."users_with_metrics" TO "anon";
GRANT ALL ON TABLE "public"."users_with_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."users_with_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."workout_assignments" TO "anon";
GRANT ALL ON TABLE "public"."workout_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."workout_block_instances" TO "anon";
GRANT ALL ON TABLE "public"."workout_block_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_block_instances" TO "service_role";



GRANT ALL ON TABLE "public"."workout_blocks" TO "anon";
GRANT ALL ON TABLE "public"."workout_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercise_groups" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercises" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."workout_plans" TO "anon";
GRANT ALL ON TABLE "public"."workout_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_plans" TO "service_role";



GRANT ALL ON TABLE "public"."workout_sessions" TO "anon";
GRANT ALL ON TABLE "public"."workout_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sessions" TO "service_role";



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
A new version of Supabase CLI is available: v2.54.11 (currently installed v2.51.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
