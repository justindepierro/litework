// Exercise Library - Comprehensive database of exercises
import { Exercise, ExerciseVariation } from "@/types";

export const exerciseLibrary: Exercise[] = [
  // Upper Body - Chest
  {
    id: "1",
    name: "Bench Press",
    description: "Classic chest exercise using a barbell",
    category: "Chest",
    targetMuscleGroups: ["Chest", "Triceps", "Shoulders"],
    instructions: [
      "Lie flat on bench with feet firmly on the ground",
      "Grip barbell with hands slightly wider than shoulders",
      "Lower bar to chest with control",
      "Press bar up explosively to full extension",
      "Keep core tight throughout movement",
    ],
    variations: [
      {
        id: "1a",
        name: "Dumbbell Bench Press",
        description: "Bench press using dumbbells for greater range of motion",
        difficulty: "same",
        reason: "Equipment variation, better range of motion",
      },
      {
        id: "1b",
        name: "Incline Bench Press",
        description: "Bench press on inclined bench targeting upper chest",
        difficulty: "harder",
        reason: "Targets upper chest, more challenging angle",
      },
      {
        id: "1c",
        name: "Push-ups",
        description: "Bodyweight alternative to bench press",
        difficulty: "easier",
        reason: "Bodyweight option, injury modification",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Push-ups",
    description: "Bodyweight chest exercise",
    category: "Chest",
    targetMuscleGroups: ["Chest", "Triceps", "Shoulders", "Core"],
    instructions: [
      "Start in plank position with hands under shoulders",
      "Lower body until chest nearly touches ground",
      "Push back up to starting position",
      "Keep body in straight line throughout",
    ],
    variations: [
      {
        id: "2a",
        name: "Knee Push-ups",
        description: "Push-ups performed from knees",
        difficulty: "easier",
        reason: "Beginner modification, injury recovery",
      },
      {
        id: "2b",
        name: "Diamond Push-ups",
        description: "Push-ups with hands forming diamond shape",
        difficulty: "harder",
        reason: "Increased tricep activation",
      },
      {
        id: "2c",
        name: "Elevated Push-ups",
        description: "Push-ups with feet elevated on bench",
        difficulty: "harder",
        reason: "Increased difficulty and upper chest focus",
      },
    ],
    createdAt: new Date(),
  },

  // Upper Body - Back
  {
    id: "3",
    name: "Pull-ups",
    description: "Bodyweight back exercise using pull-up bar",
    category: "Back",
    targetMuscleGroups: ["Latissimus Dorsi", "Rhomboids", "Biceps"],
    instructions: [
      "Hang from pull-up bar with palms facing away",
      "Pull body up until chin clears the bar",
      "Lower with control to full hang",
      "Keep core engaged throughout",
    ],
    variations: [
      {
        id: "3a",
        name: "Assisted Pull-ups",
        description: "Pull-ups with band or machine assistance",
        difficulty: "easier",
        reason: "Beginner progression, strength building",
      },
      {
        id: "3b",
        name: "Chin-ups",
        description: "Pull-ups with palms facing toward you",
        difficulty: "easier",
        reason: "Increased bicep involvement, easier grip",
      },
      {
        id: "3c",
        name: "Weighted Pull-ups",
        description: "Pull-ups with additional weight",
        difficulty: "harder",
        reason: "Advanced progression",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Bent-over Row",
    description: "Rowing movement with barbell or dumbbells",
    category: "Back",
    targetMuscleGroups: ["Latissimus Dorsi", "Rhomboids", "Rear Deltoids"],
    instructions: [
      "Hinge at hips with slight knee bend",
      "Keep back straight and chest up",
      "Pull weight to lower chest/upper abdomen",
      "Squeeze shoulder blades together",
      "Lower with control",
    ],
    variations: [
      {
        id: "4a",
        name: "Dumbbell Row",
        description: "Single-arm rowing with dumbbell",
        difficulty: "same",
        reason: "Unilateral training, equipment variation",
      },
      {
        id: "4b",
        name: "Seated Cable Row",
        description: "Rowing exercise using cable machine",
        difficulty: "easier",
        reason: "Seated position provides stability",
      },
      {
        id: "4c",
        name: "T-Bar Row",
        description: "Rowing with T-bar apparatus",
        difficulty: "same",
        reason: "Different grip angle and equipment",
      },
    ],
    createdAt: new Date(),
  },

  // Lower Body - Legs
  {
    id: "5",
    name: "Squats",
    description: "Fundamental lower body compound movement",
    category: "Legs",
    targetMuscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower body by bending knees and hips",
      "Keep chest up and weight on heels",
      "Descend until thighs parallel to ground",
      "Drive through heels to return to start",
    ],
    variations: [
      {
        id: "5a",
        name: "Goblet Squats",
        description: "Squats holding dumbbell at chest",
        difficulty: "easier",
        reason: "Easier to learn proper form, beginner friendly",
      },
      {
        id: "5b",
        name: "Front Squats",
        description: "Squats with barbell held in front rack position",
        difficulty: "harder",
        reason: "More core engagement, different muscle emphasis",
      },
      {
        id: "5c",
        name: "Box Squats",
        description: "Squats to a box or bench",
        difficulty: "easier",
        reason: "Depth control, confidence building",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "Deadlifts",
    description: "Hip hinge movement lifting weight from ground",
    category: "Legs",
    targetMuscleGroups: ["Hamstrings", "Glutes", "Lower Back", "Traps"],
    instructions: [
      "Stand with feet hip-width apart",
      "Hinge at hips and grip barbell",
      "Keep back straight and chest up",
      "Drive through heels and hips to stand",
      "Control the weight back to ground",
    ],
    variations: [
      {
        id: "6a",
        name: "Romanian Deadlifts",
        description: "Deadlift focusing on hip hinge with minimal knee bend",
        difficulty: "same",
        reason: "Hamstring focus, movement pattern practice",
      },
      {
        id: "6b",
        name: "Sumo Deadlifts",
        description: "Deadlift with wide stance",
        difficulty: "same",
        reason: "Different muscle emphasis, mobility considerations",
      },
      {
        id: "6c",
        name: "Trap Bar Deadlifts",
        description: "Deadlift using hexagonal trap bar",
        difficulty: "easier",
        reason: "More natural hand position, easier on lower back",
      },
    ],
    createdAt: new Date(),
  },

  // Shoulders
  {
    id: "7",
    name: "Overhead Press",
    description: "Pressing weight overhead from shoulder height",
    category: "Shoulders",
    targetMuscleGroups: ["Shoulders", "Triceps", "Core"],
    instructions: [
      "Stand with feet hip-width apart",
      "Start with weight at shoulder height",
      "Press weight straight overhead",
      "Keep core tight and avoid arching back",
      "Lower with control to starting position",
    ],
    variations: [
      {
        id: "7a",
        name: "Dumbbell Shoulder Press",
        description: "Overhead press using dumbbells",
        difficulty: "same",
        reason: "Unilateral training, different range of motion",
      },
      {
        id: "7b",
        name: "Seated Shoulder Press",
        description: "Overhead press performed seated",
        difficulty: "easier",
        reason: "Back support, stability assistance",
      },
      {
        id: "7c",
        name: "Pike Push-ups",
        description: "Bodyweight shoulder exercise in pike position",
        difficulty: "easier",
        reason: "Bodyweight alternative, handstand progression",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "8",
    name: "Lateral Raises",
    description: "Isolation exercise for side deltoids",
    category: "Shoulders",
    targetMuscleGroups: ["Lateral Deltoids"],
    instructions: [
      "Stand with dumbbells at sides",
      "Raise arms out to sides until parallel to ground",
      "Keep slight bend in elbows",
      "Control the weight on the way down",
      "Focus on smooth, controlled movement",
    ],
    variations: [
      {
        id: "8a",
        name: "Cable Lateral Raises",
        description: "Lateral raises using cable machine",
        difficulty: "same",
        reason: "Constant tension throughout range of motion",
      },
      {
        id: "8b",
        name: "Seated Lateral Raises",
        description: "Lateral raises performed seated",
        difficulty: "easier",
        reason: "Eliminates momentum, better isolation",
      },
      {
        id: "8c",
        name: "Resistance Band Lateral Raises",
        description: "Lateral raises using resistance bands",
        difficulty: "easier",
        reason: "Joint-friendly, variable resistance",
      },
    ],
    createdAt: new Date(),
  },

  // Arms
  {
    id: "9",
    name: "Bicep Curls",
    description: "Isolation exercise for biceps",
    category: "Arms",
    targetMuscleGroups: ["Biceps"],
    instructions: [
      "Stand with dumbbells at sides",
      "Keep elbows close to body",
      "Curl weights up to shoulders",
      "Squeeze biceps at top",
      "Lower with control",
    ],
    variations: [
      {
        id: "9a",
        name: "Hammer Curls",
        description: "Bicep curls with neutral grip",
        difficulty: "same",
        reason: "Different muscle emphasis, joint-friendly",
      },
      {
        id: "9b",
        name: "Barbell Curls",
        description: "Bicep curls using barbell",
        difficulty: "same",
        reason: "Bilateral training, heavier loading",
      },
      {
        id: "9c",
        name: "Resistance Band Curls",
        description: "Bicep curls using resistance bands",
        difficulty: "easier",
        reason: "Joint-friendly, travel-friendly option",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "10",
    name: "Tricep Dips",
    description: "Bodyweight exercise for triceps",
    category: "Arms",
    targetMuscleGroups: ["Triceps", "Chest", "Shoulders"],
    instructions: [
      "Position hands on parallel bars or bench",
      "Start with arms extended",
      "Lower body by bending elbows",
      "Push back up to starting position",
      "Keep body upright throughout",
    ],
    variations: [
      {
        id: "10a",
        name: "Assisted Tricep Dips",
        description: "Tricep dips with band or machine assistance",
        difficulty: "easier",
        reason: "Beginner progression, strength building",
      },
      {
        id: "10b",
        name: "Bench Tricep Dips",
        description: "Tricep dips using bench with feet on ground",
        difficulty: "easier",
        reason: "Easier variation, requires less strength",
      },
      {
        id: "10c",
        name: "Weighted Tricep Dips",
        description: "Tricep dips with additional weight",
        difficulty: "harder",
        reason: "Advanced progression",
      },
    ],
    createdAt: new Date(),
  },

  // Core
  {
    id: "11",
    name: "Plank",
    description: "Isometric core strengthening exercise",
    category: "Core",
    targetMuscleGroups: ["Core", "Shoulders", "Glutes"],
    instructions: [
      "Start in push-up position",
      "Hold body in straight line",
      "Engage core and glutes",
      "Breathe normally",
      "Hold for prescribed time",
    ],
    variations: [
      {
        id: "11a",
        name: "Knee Plank",
        description: "Plank performed from knees",
        difficulty: "easier",
        reason: "Beginner progression, reduced load",
      },
      {
        id: "11b",
        name: "Side Plank",
        description: "Plank performed on side",
        difficulty: "same",
        reason: "Different muscle emphasis, unilateral training",
      },
      {
        id: "11c",
        name: "Plank with Leg Lift",
        description: "Standard plank with alternating leg lifts",
        difficulty: "harder",
        reason: "Increased stability challenge",
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "12",
    name: "Mountain Climbers",
    description: "Dynamic core and cardio exercise",
    category: "Core",
    targetMuscleGroups: ["Core", "Shoulders", "Hip Flexors"],
    instructions: [
      "Start in plank position",
      "Alternate bringing knees to chest",
      "Keep hips level and core engaged",
      "Maintain quick, controlled pace",
      "Keep shoulders over hands",
    ],
    variations: [
      {
        id: "12a",
        name: "Slow Mountain Climbers",
        description: "Mountain climbers performed at slower pace",
        difficulty: "easier",
        reason: "Better form focus, reduced intensity",
      },
      {
        id: "12b",
        name: "Cross-body Mountain Climbers",
        description: "Mountain climbers bringing knee to opposite elbow",
        difficulty: "harder",
        reason: "Increased rotation and stability challenge",
      },
      {
        id: "12c",
        name: "Elevated Mountain Climbers",
        description: "Mountain climbers with hands on elevated surface",
        difficulty: "easier",
        reason: "Reduced difficulty, wrist-friendly",
      },
    ],
    createdAt: new Date(),
  },
];

// Exercise categories for filtering
export const exerciseCategories = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

// Muscle groups for detailed filtering
export const muscleGroups = [
  "Chest",
  "Latissimus Dorsi",
  "Rhomboids",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Shoulders",
  "Lateral Deltoids",
  "Rear Deltoids",
  "Biceps",
  "Triceps",
  "Core",
  "Hip Flexors",
  "Lower Back",
  "Traps",
];

// Difficulty levels
export const difficultyLevels = ["easier", "same", "harder"];

// Helper functions
export const getExercisesByCategory = (category: string): Exercise[] => {
  if (category === "All") return exerciseLibrary;
  return exerciseLibrary.filter((exercise) => exercise.category === category);
};

export const getExercisesByMuscleGroup = (muscleGroup: string): Exercise[] => {
  return exerciseLibrary.filter((exercise) =>
    exercise.targetMuscleGroups.includes(muscleGroup)
  );
};

export const searchExercises = (query: string): Exercise[] => {
  const lowercaseQuery = query.toLowerCase();
  return exerciseLibrary.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(lowercaseQuery) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(lowercaseQuery)) ||
      exercise.category.toLowerCase().includes(lowercaseQuery) ||
      exercise.targetMuscleGroups.some((muscle) =>
        muscle.toLowerCase().includes(lowercaseQuery)
      )
  );
};

export const getExerciseVariations = (
  exerciseId: string
): ExerciseVariation[] => {
  const exercise = exerciseLibrary.find((ex) => ex.id === exerciseId);
  return exercise?.variations || [];
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exerciseLibrary.find((exercise) => exercise.id === id);
};
