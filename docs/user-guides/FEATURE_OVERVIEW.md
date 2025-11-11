# LiteWork Feature Overview

Complete guide to all features available in LiteWork v1.0.

## Core Features

### User Management & Authentication

**Multi-Role System**:

- **Admin**: Full system access, manages coaches and athletes
- **Coach**: Manages athletes, creates workouts, assigns programs
- **Athlete**: Records workouts, tracks progress

**Security Features**:

- Secure authentication with Supabase Auth
- Role-based access control (RBAC)
- Row-level security (RLS) on database
- Password reset flow
- Email-based invitations
- Session management

**User Profile**:

- First and last name
- Email address
- Sport and position
- Profile photo (optional)
- Role and permissions
- Account creation date

## For Coaches

### Athlete Management

**Individual Athletes**:

- Add athletes via email invitation
- View athlete profiles
- Track athlete progress
- View workout history
- Monitor completion rates
- Assign individual workouts

**Groups**:

- Create sport/position-based groups
- Add/remove athletes from groups
- Bulk workout assignments to groups
- View group analytics
- Filter by sport, position, or custom criteria

**Invitations**:

- Send email invitations to athletes
- Track invitation status (pending/accepted)
- Resend invitations if needed
- Automatic account creation on acceptance

### Workout Creation

**Advanced Workout Editor**:

- Modal-based editor with live preview
- Drag-and-drop exercise reordering
- Exercise library integration (500+ exercises)
- Save as template for reuse
- Duplicate existing workouts
- Archive unused workouts

**Exercise Library**:

- 500+ pre-loaded exercises
- Filter by:
  - Muscle group (Chest, Back, Legs, Shoulders, Arms, Core)
  - Equipment (Barbell, Dumbbell, Machine, Bodyweight, Cable)
  - Movement pattern (Push, Pull, Squat, Hinge, Carry)
- Search by exercise name
- View exercise details:
  - Description and instructions
  - Primary and secondary muscles
  - Equipment needed
  - Video demonstrations (YouTube/Vimeo links)
- Create custom exercises
- Mark favorites for quick access

**Exercise Parameters**:

- **Sets**: Number of sets (e.g., 3-5)
- **Reps**: Reps per set or rep range (e.g., "8-12")
- **Weight**: Specific weight or percentage of 1RM (e.g., "70% 1RM")
- **Tempo**: Four-part tempo notation (e.g., "3-1-1-0")
- **Rest**: Rest between sets in seconds
- **RPE**: Target Rate of Perceived Exertion (1-10)
- **Notes**: Exercise-specific coaching cues
- **Order**: Position in workout

**Exercise Grouping**:

_Supersets_ (2-4 exercises):

- Exercises performed back-to-back
- Minimal rest between exercises
- Rest after completing all exercises
- Perfect for antagonistic pairings
- Label as A1/A2 or B1/B2/B3

_Circuits_ (5+ exercises):

- Multiple exercises in sequence
- Set number of rounds
- Rest between exercises and rounds
- Great for conditioning work
- Efficient for large groups

_Sections_ (Organizational):

- Group exercises by phase (Warm-up, Main, Accessory)
- Visual separation in workout view
- Help athletes understand workout structure
- No special execution order

**Workout Templates**:

- Save workouts as reusable templates
- Duplicate templates to create new workouts
- Edit templates without affecting assigned workouts
- Organize templates by category
- Quick access to frequently used programs

**Workout Blocks** (Coming Soon):

- Pre-built exercise combinations
- Sport-specific training blocks
- Periodization templates
- Program building blocks

### Assignment System

**Individual Assignment**:

- Assign workouts to specific athletes
- Set start date and optional due date
- Add assignment-specific notes
- Track assignment status
- View completion status

**Group Assignment**:

- Assign workouts to entire groups
- All group members receive the same workout
- Set start date for the group
- Track group completion rates
- Bulk assignment saves time

**Individual Modifications**:
After group assignment, customize for specific athletes:

- Change exercise weights
- Modify sets/reps
- Substitute exercises
- Add athlete-specific notes
- Useful for:
  - Injured athletes
  - Beginners needing reduced volume
  - Advanced athletes needing more intensity
  - Equipment limitations

**Assignment Scheduling**:

- Schedule workouts in advance
- Set start and due dates
- View upcoming assignments in calendar
- Automatic notifications (coming soon)

### Progress Tracking & Analytics

**Workout History**:

- View all completed sessions by athlete
- See exercises performed
- Review weights, sets, and reps
- Read athlete notes and feedback
- Track completion rates

**Performance Metrics**:

- Total workouts completed
- Total volume (weight × sets × reps)
- Average workout duration
- Completion percentage
- Streak tracking

**1RM Tracking**:

- Automatic 1RM estimates from heaviest sets
- Track 1RM progress over time
- View PRs by exercise
- Compare to previous baselines

**Progress Charts** (Coming Soon):

- Volume trends over time
- Strength progression curves
- Completion rate by group
- Attendance patterns

### Calendar & Scheduling

**Calendar View**:

- See all assignments by date
- Color-coded by group or athlete
- Drag-and-drop rescheduling
- Week and month views
- Filter by athlete or group

**Events** (Coming Soon):

- Schedule training sessions
- Team meetings and events
- Competition dates
- Deload weeks

## For Athletes

### Workout Interface

**View Mode** (Pre-Workout Review):

- Overview of all exercises
- Target weights and reps
- Coach's notes and instructions
- Estimated duration
- Exercise grouping visualization
- Plan equipment needs

**Live Mode** (During Workout):

- Full-screen, distraction-free interface
- Large touch-friendly buttons
- One exercise at a time
- Quick set logging
- Auto-progressing through exercises
- Rest timer between sets
- Optimized for mobile use in gym

### Workout Recording

**Set Logging**:

- Record weight used
- Record reps completed
- Optional RPE rating (1-10)
- Optional set notes
- Timestamp for each set
- Auto-save after each set

**Rest Timer**:

- Automatic timer starts after set
- Shows recommended rest time
- Visual countdown
- Vibration/sound notification when ready
- Can skip rest if recovered early
- Configurable defaults

**Exercise Groups**:

- Clear indication of supersets/circuits
- Visual grouping with labels
- Guidance on rest periods
- Tracking rounds completed
- Circuit timer

**Workout Notes**:

- Add notes during or after workout
- Rate overall session difficulty
- Report any issues or concerns
- Ask coach questions
- Record how you felt

### Progress Tracking

**Workout History**:

- View all completed workouts
- Filter by date range
- Search by workout name
- Filter by status (completed/in-progress)
- Export data as CSV
- Pagination for large histories

**Personal Records**:

- Track PRs by exercise
- View 1RM estimates
- See when PRs were set
- Trend lines showing progress
- Compare to previous months

**Body Measurements**:

- Log weight and body fat %
- Track body measurements (optional):
  - Arms, chest, waist, hips, thighs
- View measurement trends on charts
- Compare to baseline
- Progress photos (coming soon)

**Performance Analytics**:

- Total volume by week/month
- Workout completion rate
- Average session duration
- Training frequency
- Volume by muscle group
- Exercise frequency

### Mobile Experience

**Progressive Web App (PWA)**:

- Install on home screen (iOS & Android)
- Works offline
- Fast loading
- Native app feel
- Push notifications (coming soon)

**Offline Capabilities**:

- View assigned workouts offline
- Record sets without internet
- Automatic sync when back online
- Queue actions for later sync
- Perfect for gyms with poor Wi-Fi

**Mobile Optimizations**:

- Touch-friendly buttons (44px minimum)
- Large text in Live Mode
- Swipe gestures for navigation
- Pull-to-refresh
- Responsive design for all screen sizes
- Landscape support

## For Admins

### System Management

**User Administration**:

- Create and manage coach accounts
- View all users in system
- Reset passwords for users
- Deactivate/reactivate accounts
- Audit user activity logs
- Manage roles and permissions

**Coach Management**:

- Assign coaches to sports/teams
- Monitor coach activity
- View coaches' athlete rosters
- Access coach-created content
- Override assignments if needed

**Athlete Management**:

- View all athletes across coaches
- Transfer athletes between coaches
- Manage athlete group memberships
- Access athlete workout history
- Generate reports

**System Configuration**:

- Manage exercise library
- Configure system settings
- Set up sports and positions
- Manage email templates
- Configure notifications

### Reporting & Analytics

**System-Wide Metrics**:

- Total users by role
- Active users (daily/weekly/monthly)
- Workout completion rates
- Most used exercises
- Popular workout templates
- System usage trends

**Coach Performance**:

- Athletes per coach
- Assignment frequency
- Athlete engagement rates
- Workout variety
- Response time to athlete questions

**Export Capabilities**:

- User data export
- Workout history export
- Analytics data export
- CSV format for analysis

## Shared Features

### Dashboard

**Coach Dashboard**:

- Total athletes
- Active workout assignments
- Pending assignments
- Recent athlete activity
- Upcoming scheduled assignments
- Quick actions (Create workout, Assign workout)

**Athlete Dashboard**:

- Assigned workouts
- Upcoming sessions
- Completed workouts this week
- Total volume this week
- Recent PRs
- Quick start buttons

**Admin Dashboard**:

- Total system users
- Active coaches and athletes
- System usage statistics
- Recent user registrations
- System health metrics

### Navigation

**Main Menu**:

- Dashboard
- Workouts (view/create/assign)
- Athletes/Groups (coaches)
- History (athletes)
- Progress (athletes)
- Exercises (library)
- Calendar
- Profile
- Settings
- Help

**Breadcrumbs**:

- Show current location in app
- Click to navigate back
- Especially useful in multi-step flows

### Search & Filtering

**Global Search**:

- Search workouts by name
- Search athletes by name
- Search exercises by name
- Recent searches
- Search history

**Advanced Filters**:

- Multiple filter criteria
- Date ranges
- Status filters
- Sport/position filters
- Group filters
- Save filter presets (coming soon)

### Notifications

**Email Notifications**:

- Workout assignments
- Account invitations
- Password reset links
- Coach messages (coming soon)
- Achievement notifications (coming soon)

**In-App Notifications** (Coming Soon):

- Real-time updates
- New assignments
- Messages from coach
- PR achievements
- Missed workout reminders

### Settings

**User Settings**:

- Update profile information
- Change password
- Email preferences
- Notification settings
- Privacy settings
- Theme preferences (coming soon)

**Coach Settings**:

- Default workout templates
- Assignment preferences
- Exercise library favorites
- Group management preferences

**Athlete Settings**:

- Measurement units (lbs/kg)
- Rest timer defaults
- Sound/vibration preferences
- Display preferences

## Technical Features

### Performance

**Optimizations**:

- Fast page loads (<2 seconds)
- Lazy loading of images
- Code splitting for faster initial load
- Efficient database queries with indexes
- Caching of frequently accessed data
- Optimistic UI updates

**Scalability**:

- Built on Supabase (PostgreSQL)
- Row-level security (RLS)
- 34 database tables with proper indexing
- Handles 1000+ users efficiently
- Real-time updates via websockets

### Security

**Data Protection**:

- All data encrypted in transit (HTTPS)
- Database encryption at rest
- Row-level security policies
- Role-based access control
- No sensitive data in URLs
- CSRF protection

**Authentication**:

- Secure password hashing
- Password strength requirements
- Session management
- Automatic session expiration
- Password reset flow
- Rate limiting on login attempts

**Privacy**:

- Athletes can only see their own data
- Coaches can only see their athletes
- Admins have full access
- Audit logs for sensitive operations

### Reliability

**Error Handling**:

- Graceful error messages
- Automatic retry for failed requests
- Offline queue for sync
- Data validation before save
- Transaction rollbacks on errors

**Data Integrity**:

- Foreign key constraints
- Check constraints on data
- Triggers for data consistency
- Automatic timestamps
- Soft deletes for recoverability

### Browser Support

**Supported Browsers**:

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 8+)

**PWA Support**:

- iOS Safari (Add to Home Screen)
- Android Chrome (Install App)
- Desktop Chrome/Edge (Install)

## Integrations (Planned)

### Future Integrations:

- Google Calendar sync
- Strava integration
- MyFitnessPal nutrition tracking
- Wearable device sync (Apple Watch, Fitbit)
- Video platform integration (YouTube, Vimeo)
- Team communication (Slack, Discord)

## Limitations & Known Issues

### Current Limitations:

**v1.0 Constraints**:

- No automated periodization yet
- No video exercise library (external links only)
- No built-in messaging system
- No team communication features
- No automated workout progression
- No mobile native app (PWA only)
- Limited analytics/reporting
- No exercise substitution AI

**Data Limits**:

- 500+ exercises in library (expanding)
- Unlimited workouts per coach
- Unlimited athletes per coach
- 1000+ users system-wide (tested)

### Coming in Future Releases:

**v1.1 Features**:

- Advanced analytics dashboard
- Coach-athlete messaging
- Exercise video library
- Workout templates marketplace
- Achievement system with badges
- Automated workout progression
- Exercise substitution suggestions

**v1.2 Features**:

- Program builder with periodization
- Team leaderboards
- Social features
- Mobile app (iOS & Android)
- Wearable integrations
- Nutrition tracking integration

## Getting Help

### Resources:

- **Quick Start Guides**: `/docs/user-guides/`
- **Troubleshooting Guide**: `/docs/user-guides/TROUBLESHOOTING.md`
- **Video Tutorials**: Coming soon
- **FAQ**: Coming soon

### Support:

- **Email**: support@litework.app
- **Response Time**: Within 24 hours (weekdays)
- **In-App Help**: Click "Help" in navigation

### Community:

- **Coach Forum**: Coming soon
- **Feature Requests**: Submit via support email
- **Bug Reports**: support@litework.app

---

_Last Updated: November 2025_  
_Version: 1.0_
