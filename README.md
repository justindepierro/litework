# LiteWork - Workout Tracker for Weight Lifting Club

A comprehensive web-based workout tracking application designed for weight lifting clubs. This app enables coaches to manage athlete groups, assign workouts, and track progress, while providing athletes with interactive workout sessions and progress monitoring.

## 🏋️ Features

### For Coaches:

- **📅 Training Calendar**: Monthly/weekly calendar view to schedule and manage workouts
- **👥 Group Management**: Organize athletes into sport-specific groups (Football Linemen, Volleyball Girls, Cross Country Boys, etc.)
- **🏋️ Workout Assignment**: Bulk assign workouts to entire groups with scheduling
- **⚙️ Individual Modifications**: Customize group workouts for individual athletes based on experience, injury status, or specific needs
- **📊 Progress Tracking**: Monitor athlete progress and performance metrics

### For Athletes:

- **👀 View Mode**: Review assigned workouts with exercise details, target weights, and reps
- **🔴 Live Mode**: Interactive workout session with big buttons for recording sets, weights, and reps
- **📈 Progress Tracking**: Monitor personal improvements and workout history
- **📱 Mobile-First Design**: Optimized for use on phones and tablets in the gym

## 🛠️ Technical Stack

- **Frontend**: Next.js 16 with React and TypeScript
- **Styling**: Tailwind CSS with custom design token system
- **State Management**: React Context API
- **Authentication**: JWT-based authentication system
- **Progressive Web App**: PWA capabilities for mobile installation

## 🤖 GitHub Copilot Integration

This project is optimized for GitHub Copilot development with comprehensive instructions and context. The codebase follows consistent patterns and includes detailed type definitions to help Copilot provide accurate suggestions.

### Copilot Instructions Location

The project includes detailed Copilot instructions in `.github/copilot-instructions.md` that provide:

- Project overview and architecture
- Key features and user roles (coaches vs athletes)
- Development guidelines and best practices
- Component structure and patterns
- TypeScript integration standards

### Development with Copilot Tips

1. **Context Awareness**: The instructions help Copilot understand this is a weight lifting club application with specific domain knowledge
2. **Type Safety**: Strong TypeScript definitions in `src/types/index.ts` guide Copilot's suggestions
3. **Component Patterns**: Consistent React patterns help Copilot generate appropriate component code
4. **Design System**: Copilot understands the design token system and can suggest appropriate styling

### Key Features Enhanced by Copilot

- **Workout Editor**: Advanced exercise grouping with supersets, circuits, and sections
- **Exercise Management**: Comprehensive exercise library with drag-and-drop organization
- **Group Assignment**: Bulk workout assignment to athlete groups
- **Progress Tracking**: Automatic progression suggestions and analytics

### Using Copilot Effectively

- Reference the copilot instructions when asking for complex features
- Mention specific component names and their purposes for better context
- Use the established TypeScript interfaces when requesting new functionality
- Follow the existing design token system for consistent styling

## 🎨 Design System

### Light Mode Theme:

- **Background**: Clean white (#ffffff)
- **Primary**: Navy blue (#1e3a8a) for headers and navigation
- **Secondary**: Silver gray (#64748b) for body text
- **Accent Colors**:
  - Orange (#ff6b35) for workout actions
  - Green (#00d4aa) for progress indicators
  - Blue (#3b82f6) for system actions
  - Purple (#8b5cf6) for achievements

### Mobile-First Approach:

- Responsive grid layouts that adapt to screen size
- Touch-friendly button sizes for gym use
- Progressive enhancement for larger screens

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Main dashboard for coaches and athletes
│   ├── login/            # Authentication page
│   ├── workouts/         # Workout management
│   │   ├── live/         # Live workout sessions
│   │   └── view/         # Workout review mode
│   ├── members/          # Member management
│   ├── progress/         # Progress tracking
│   └── schedule/         # Schedule management
├── components/           # Reusable React components
│   ├── Navigation.tsx    # App navigation
│   ├── WorkoutView.tsx   # Workout viewing component
│   ├── WorkoutLive.tsx   # Interactive workout session
│   ├── CalendarView.tsx  # Training calendar for coaches
│   ├── GroupAssignmentModal.tsx  # Group workout assignment
│   └── AthleteModificationModal.tsx  # Individual customizations
├── contexts/            # React context providers
│   └── AuthContext.tsx  # Authentication state management
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
└── styles/            # Design system and styling
    ├── design-tokens.css  # CSS custom properties
    ├── theme.ts          # Theme configuration
    └── tokens.ts         # Design token definitions
```

## 🚀 Key Components

### Advanced Workout Editor

- **Exercise Grouping**: Create supersets (2-4 exercises), circuits (5+ exercises), and workout sections
- **Drag-and-Drop Organization**: Manual reordering with up/down controls for precise workout structure
- **Unified Experience**: Same advanced editor for both creating new workouts and editing existing ones
- **Exercise Library Integration**: Browse and add exercises from comprehensive library
- **Type-Safe Architecture**: Full TypeScript support with enhanced interfaces

### Group Management System

- **AthleteGroup**: Organize athletes by sport and category
- **WorkoutModification**: Individual customizations for group workouts
- **CalendarEvent**: Schedule training sessions and events

### Workout System

- **View Mode**: Athletes can review assigned workouts before training
- **Live Mode**: Interactive session with set-by-set recording
- **Progress Tracking**: Automatic weight and rep progression suggestions

### Individual Customizations

- **Exercise Modifications**: Alternative exercises for injuries or equipment limitations
- **Volume Adjustments**: Modify sets, reps, or weights for individual athletes
- **Reason Tracking**: Document why modifications were made (injury, beginner level, etc.)

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 PWA Features

- **Offline Capability**: Core functionality works without internet
- **Mobile Installation**: Can be installed on mobile devices
- **Push Notifications**: Workout reminders and updates (future)

## � Recent Enhancements

### Workout Editor Overhaul (October 2025)

- **Advanced Exercise Grouping**: Implemented comprehensive superset, circuit, and section organization
- **Unified Create/Edit Experience**: Replaced basic create form with advanced editor for consistency
- **Enhanced TypeScript Support**: Added `ExerciseGroup` interface and improved type safety
- **Improved UX**: Manual drag-and-drop controls with up/down arrows for precise organization
- **Modal-Based Interface**: Professional full-screen editor with collapsible group containers

### Technical Improvements

- **Component Architecture**: Modular `WorkoutEditor` component with reusable exercise management
- **State Management**: Clean separation between creating and editing workflows
- **Type Definitions**: Enhanced `WorkoutExercise` interface with `groupId` property for organization
- **Code Cleanup**: Removed legacy create form code and unused state variables

## �🏃 Workout Examples

### Football Linemen Workout

- Back Squat: 5×5 @ 85%
- Bench Press: 3×8 @ 80%
- Deadlift: 3×5 @ 80%
- Overhead Press: 3×10 @ 70%

### Volleyball Girls Workout

- Jump Squats: 4×8 (bodyweight)
- Push-ups: 3×12
- Lunges: 3×10 each leg
- Plank Hold: 3×30 seconds

## 🔮 Future Enhancements

- **Video Exercise Library**: Exercise demonstrations and tutorials
- **Nutrition Tracking**: Meal planning and macro tracking
- **Performance Analytics**: Advanced statistics and trend analysis
- **Team Challenges**: Competitive elements and leaderboards
- **Coach Communication**: Direct messaging between coaches and athletes

## 🤝 Contributing

This project is designed for weight lifting clubs and can be customized for specific team needs. The modular component structure makes it easy to add new features or modify existing functionality.

### Working with GitHub Copilot

When developing with Copilot on this project:

1. **Reference Context**: Always mention you're working on a "weight lifting club workout tracker"
2. **Use Type Definitions**: Reference the types in `src/types/index.ts` for accurate suggestions
3. **Follow Patterns**: The codebase uses consistent React patterns that Copilot can learn from
4. **Mention Specific Features**: Reference supersets, circuits, athlete groups, etc. for domain-specific help
5. **Design System**: Use the established design tokens and Tailwind classes for consistency

### Development Guidelines

- **TypeScript First**: All components use TypeScript with comprehensive type definitions
- **Mobile-First Design**: Components are built for touch interfaces and mobile use
- **Component Isolation**: Each feature is modular and can be developed independently
- **Progressive Enhancement**: Basic functionality works everywhere, enhanced features for modern browsers

## 📄 License

Built for educational and team use. Modify and distribute as needed for your weight lifting club.

---

**Built with ❤️ for weight lifting clubs everywhere** 🏋️‍♂️🏋️‍♀️
