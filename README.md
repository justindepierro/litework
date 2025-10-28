# Workout Tracker - Weight Lifting Club# Workout Tracker - Weight Lifting ClubThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, **mobile-first** web application for tracking workouts, progress, and schedules for weight lifting club members and coaches.



## 📱 Mobile-First FeaturesA modern web application for tracking workouts, progress, and schedules for weight lifting club members and coaches.## Getting Started



- **PWA Ready**: Installable as a mobile app with offline capabilities

- **Touch-Optimized**: 44px minimum touch targets for better usability

- **Responsive Design**: Seamless experience from mobile to desktop## FeaturesFirst, run the development server:

- **Mobile Navigation**: Collapsible hamburger menu with touch-friendly interface

- **Optimized Performance**: Fast loading times and smooth animations

- **Safe Area Support**: Works perfectly on notched devices (iPhone X+)

### For Members:```bash

## 🚀 Features

- ✅ Record workout sessions (sets, reps, weight)npm run dev

### For Members:

- ✅ Record workout sessions (sets, reps, weight)- ✅ Track personal progress over time# or

- ✅ Track personal progress over time

- ✅ View assigned workout schedules- ✅ View assigned workout schedulesyarn dev

- ✅ Monitor personal statistics and improvements

- ✅ Quick action buttons and floating action button (FAB)- ✅ Monitor personal statistics and improvements# or



### For Coaches/Admins:pnpm dev

- ✅ Create and manage workout plans

- ✅ Set schedules for members### For Coaches/Admins:# or

- ✅ View member progress and statistics

- ✅ Manage user accounts- ✅ Create and manage workout plansbun dev



## 🛠️ Technology Stack- ✅ Set schedules for members```



- **Frontend**: Next.js 16 with React- ✅ View member progress and statistics

- **Styling**: Tailwind CSS with mobile-first approach

- **Language**: TypeScript- ✅ Manage user accountsOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Authentication**: JWT-based system (mock implementation)

- **State Management**: React Context API

- **PWA**: Service Worker ready with manifest.json

## Technology StackYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 📲 Getting Started



### Prerequisites

- Node.js 18+ - **Frontend**: Next.js 16 with ReactThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- npm or yarn

- **Styling**: Tailwind CSS

### Installation

- **Language**: TypeScript## Learn More

1. Clone the repository:

```bash- **Authentication**: JWT-based system (mock implementation)

git clone <repository-url>

cd LiteWork- **State Management**: React Context APITo learn more about Next.js, take a look at the following resources:

```



2. Install dependencies:

```bash## Getting Started- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

npm install

```- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



3. Run the development server:### Prerequisites

```bash

npm run dev- Node.js 18+ You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

```

- npm or yarn

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

### Default Login Credentials

- **Email**: coach@example.com### Installation

- **Password**: password

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## 📱 Mobile Experience

1. Clone the repository:

The app is designed mobile-first with these key optimizations:

```bashCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Touch-friendly interface** with proper touch target sizes

- **Responsive navigation** that collapses on mobile with hamburger menugit clone <repository-url>

- **Fast loading** with optimized bundle sizescd LiteWork

- **PWA capabilities** - can be installed as a native app```

- **Smooth animations** and transitions

- **Safe area padding** for notched devices2. Install dependencies:

```bash

## 🏗️ Project Structurenpm install

```

```

src/3. Run the development server:

├── app/                    # Next.js app router pages```bash

│   ├── dashboard/          # Dashboard page (mobile-optimized)npm run dev

│   ├── login/              # Login page (mobile-friendly)```

│   ├── layout.tsx          # Root layout with PWA meta tags

│   ├── page.tsx            # Home page (mobile-first design)4. Open [http://localhost:3000](http://localhost:3000) in your browser.

│   └── globals.css         # Global styles with mobile optimizations

├── components/             # Reusable UI components### Default Login Credentials

│   └── Navigation.tsx      # Mobile-responsive navigation- **Email**: coach@example.com

├── contexts/               # React contexts- **Password**: password

│   └── AuthContext.tsx     # Authentication context

└── types/                  # TypeScript type definitions## Project Structure

    └── index.ts            # Shared types

``````

src/

## 📱 Mobile Features├── app/                    # Next.js app router pages

│   ├── dashboard/          # Dashboard page

### Navigation│   ├── login/              # Login page

- Hamburger menu for mobile devices│   ├── layout.tsx          # Root layout

- Touch-friendly navigation items│   └── page.tsx            # Home page

- Emoji icons for better visual hierarchy├── components/             # Reusable UI components

- Sticky header for easy access│   └── Navigation.tsx      # Navigation component

├── contexts/               # React contexts

### Dashboard│   └── AuthContext.tsx     # Authentication context

- Mobile-optimized card layout└── types/                  # TypeScript type definitions

- Quick stats with large touch targets    └── index.ts            # Shared types

- Floating Action Button (FAB) for quick workout creation```

- Responsive grid system

## Available Scripts

### Forms

- Large input fields (44px minimum)- `npm run dev` - Start development server

- Prevents zoom on iOS devices- `npm run build` - Build for production

- Touch-friendly buttons- `npm run start` - Start production server

- Clear visual feedback- `npm run lint` - Run ESLint



## 🚀 Available Scripts## Features to Implement



- `npm run dev` - Start development server### Next Steps:

- `npm run build` - Build for production1. **Database Integration**: Add MongoDB or PostgreSQL for data persistence

- `npm run start` - Start production server2. **Workout Management**: Create/edit workout plans and exercises

- `npm run lint` - Run ESLint3. **Progress Tracking**: Charts and analytics for member progress

4. **Schedule Management**: Calendar view for workout schedules

## 🔄 Next Development Steps5. **User Management**: Admin panel for managing members and coaches

6. **Real Authentication**: Replace mock auth with actual backend API

### Immediate Features:7. **Mobile Responsiveness**: Optimize for mobile devices

1. **Database Integration**: Add MongoDB or PostgreSQL for data persistence8. **Data Export**: Export workout data and progress reports

2. **Workout Recording**: Real-time workout session tracking

3. **Progress Charts**: Visual progress tracking with mobile-friendly charts### API Routes to Add:

4. **Push Notifications**: Workout reminders and achievement notifications- `/api/auth` - Authentication endpoints

- `/api/users` - User management

### Mobile Enhancements:- `/api/workouts` - Workout CRUD operations

1. **Offline Support**: Service Worker for offline functionality- `/api/exercises` - Exercise database

2. **Camera Integration**: Photo progress tracking- `/api/progress` - Progress tracking

3. **Touch Gestures**: Swipe actions for quick operations- `/api/schedules` - Schedule management

4. **Voice Commands**: Hands-free workout recording

5. **Apple Health/Google Fit**: Integration with fitness platforms## Contributing



### API Routes to Add:1. Fork the repository

- `/api/auth` - Authentication endpoints2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

- `/api/users` - User management3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

- `/api/workouts` - Workout CRUD operations4. Push to the branch (`git push origin feature/AmazingFeature`)

- `/api/exercises` - Exercise database5. Open a Pull Request

- `/api/progress` - Progress tracking

- `/api/schedules` - Schedule management## License



## 📱 PWA InstallationThis project is licensed under the MIT License - see the LICENSE file for details.

Users can install this app on their mobile devices:

1. **iOS Safari**: Tap the share button → "Add to Home Screen"
2. **Android Chrome**: Tap the menu → "Add to Home Screen" or look for the install prompt
3. **Desktop**: Look for the install icon in the address bar

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for mobile-first fitness tracking**