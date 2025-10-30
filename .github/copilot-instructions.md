# LiteWork - Workout Tracker for Weight Lifting Club

This is a comprehensive web-based workout tracking application designed for weight lifting clubs. The application enables coaches to manage athlete groups, assign workouts with advanced exercise organization, and track progress, while providing athletes with interactive workout sessions and progress monitoring.

## Project Architecture

This is a modern full-stack web application built with:

- **Framework**: Next.js 16 with App Router (full-stack React framework)
- **Language**: TypeScript for complete type safety
- **Styling**: Tailwind CSS with custom design token system
- **State Management**: React Context API with local component state
- **Authentication**: JWT-based user authentication system
- **PWA**: Progressive Web App capabilities for mobile installation
- **Deployment**: Optimized for serverless deployment

## Key Features

### For Coaches/Admins:

- **Advanced Workout Editor**: Create workouts with exercise grouping (supersets, circuits, sections)
- **Group Management**: Organize athletes by sport/category (Football Linemen, Volleyball Girls, etc.)
- **Bulk Assignment**: Assign workouts to entire groups with scheduling
- **Individual Modifications**: Customize group workouts for specific athletes (injuries, experience levels)
- **Progress Analytics**: Monitor athlete progress and performance metrics
- **Calendar Management**: Schedule training sessions and events

### For Athletes:

- **View Mode**: Review assigned workouts with exercise details and target weights
- **Live Mode**: Interactive workout sessions with large touch-friendly buttons
- **Progress Tracking**: Monitor personal improvements and workout history
- **Mobile-First**: Optimized for use on phones and tablets in the gym
- **Offline Capability**: Core functionality works without internet connection

## Recent Major Enhancements (October 2025)

### Advanced Workout Editor System

- **Exercise Grouping**: Comprehensive superset, circuit, and section organization
- **Unified Experience**: Same advanced editor for both creating and editing workouts
- **Drag-and-Drop**: Manual reordering with up/down controls for precise organization
- **Exercise Library Integration**: Browse and add exercises from comprehensive library
- **Type-Safe Architecture**: Enhanced TypeScript interfaces with `ExerciseGroup` and updated `WorkoutExercise`

### Technical Improvements

- **Component Modularity**: Reusable `WorkoutEditor` component with clean state management
- **Enhanced Types**: Added `groupId` property to `WorkoutExercise` and `ExerciseGroup` interface
- **Modal Interface**: Professional full-screen editor with collapsible containers
- **Code Cleanup**: Removed legacy create form code for unified experience

## Development Guidelines

- **TypeScript First**: Use comprehensive type definitions from `src/types/index.ts`
- **Mobile-First Design**: Build for touch interfaces and mobile gym use
- **Component Patterns**: Follow established React patterns with functional components and hooks
- **Design System**: Use design tokens and consistent Tailwind classes
- **Progressive Enhancement**: Ensure basic functionality works everywhere
- **Domain Knowledge**: Understand weight lifting terminology (supersets, circuits, 1RM, etc.)

## File Organization

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/contexts/` - React Context providers for global state
- `src/types/` - TypeScript type definitions and interfaces
- `src/styles/` - Design system, tokens, and custom CSS
- `src/lib/` - Utility functions and shared logic
- `src/hooks/` - Custom React hooks

## Key Components

### WorkoutEditor (`src/components/WorkoutEditor.tsx`)

- Advanced modal-based workout creation and editing
- Exercise grouping with supersets, circuits, and sections
- Drag-and-drop organization with manual controls
- Exercise library integration
- Type-safe with comprehensive interfaces

### Group Management

- `GroupAssignmentModal.tsx` - Bulk workout assignment to athlete groups
- `AthleteModificationModal.tsx` - Individual customizations for group workouts
- `GroupFormModal.tsx` - Create and manage athlete groups

### Workout Sessions

- `WorkoutView.tsx` - Review mode for assigned workouts
- `WorkoutLive.tsx` - Interactive workout session with set recording
- `ProgressAnalytics.tsx` - Performance tracking and statistics

## Domain-Specific Context

### Weight Lifting Terminology

- **Superset**: 2-4 exercises performed back-to-back with minimal rest
- **Circuit**: 5+ exercises performed in sequence, often for conditioning
- **1RM**: One-rep maximum, the heaviest weight an athlete can lift once
- **Volume**: Total work performed (sets × reps × weight)
- **Progressive Overload**: Gradually increasing training demands over time

### Athlete Categories

- Sport-specific groups (Football, Volleyball, Cross Country, etc.)
- Position-specific training (Linemen, Skill players, etc.)
- Experience levels (Beginner, Intermediate, Advanced)
- Gender-specific programming when appropriate

### Workout Modifications

- **Exercise Substitutions**: Alternative exercises for injuries or equipment limitations
- **Volume Adjustments**: Modified sets, reps, or weights for individual needs
- **Progression Tracking**: Automatic weight and rep suggestions based on performance
