-- Transaction-safe functions for workout operations
-- These functions ensure atomic operations for creating and updating workout plans

-- Function: create_workout_plan_transaction
-- Creates a workout plan with exercises, groups, and block instances in a single transaction
-- Returns the newly created workout plan ID
CREATE OR REPLACE FUNCTION create_workout_plan_transaction(
  p_name TEXT,
  p_description TEXT,
  p_estimated_duration INTEGER,
  p_target_group_id UUID,
  p_created_by UUID,
  p_archived BOOLEAN,
  p_exercises JSONB,
  p_groups JSONB,
  p_block_instances JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan_id UUID;
  v_exercise JSONB;
  v_group JSONB;
  v_block_instance JSONB;
  v_exercise_id UUID;
  v_kpi_tag TEXT;
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

  -- 2. Insert exercise groups if provided
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
        v_plan_id,
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

  -- 3. Insert exercises if provided
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
        v_plan_id,
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

  -- 4. Insert block instances if provided
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
      );
    END LOOP;
  END IF;

  RETURN v_plan_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Any error will cause the entire transaction to rollback
    RAISE;
END;
$$;

-- Function: update_workout_plan_transaction
-- Updates a workout plan with exercises, groups, and block instances in a single transaction
-- Deletes existing exercises/groups/blocks and recreates them
CREATE OR REPLACE FUNCTION update_workout_plan_transaction(
  p_plan_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_estimated_duration INTEGER,
  p_target_group_id UUID,
  p_archived BOOLEAN,
  p_exercises JSONB,
  p_groups JSONB,
  p_block_instances JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_workout_plan_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION update_workout_plan_transaction TO authenticated;
