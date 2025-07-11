# 💪 Workout Tracker PWA

A modern Progressive Web App (PWA) for tracking workouts, exercises, and sets. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring a clean mobile-first design with offline capabilities and real-time data synchronization.

🚀 **[Live Demo](https://workout-tracker-pwa-nu.vercel.app/)** - Try it now!

![Workout Tracker](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)

## 🚀 Features

### Core Functionality

- **🏋️ Workout Management**: Create, edit, and delete custom workouts
- **💪 Exercise Tracking**: Add exercises to workouts with detailed set information
- **📊 Set Recording**: Track weight, reps, and timestamps for each set
- **📱 Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **🔄 Drag & Drop**: Reorder workouts and exercises with intuitive drag-and-drop
- **✏️ Inline Editing**: Edit sets directly with click-to-edit functionality

### Progressive Web App Features

- **📲 Installable**: Add to home screen on mobile and desktop
- **⚡ Offline Support**: Works without internet connection
- **🔄 Auto-Sync**: Automatic data synchronization when online
- **🎨 Native Feel**: App-like experience with custom splash screens
- **📱 Responsive**: Adapts to all screen sizes and orientations

### User Experience

- **🔐 User Authentication**: Secure Google OAuth authentication with Auth.js
- **👤 Account Management**: User profile and settings
- **🎯 Intuitive Navigation**: Clean, simple interface with minimal learning curve
- **⚡ Fast Performance**: Optimized for speed with Server Components and smooth interactions
- **🌙 Modern UI**: Beautiful design with shadcn/ui components
- **🔄 Route-Based Navigation**: Separate pages for workouts, exercises, and sets with browser back button support
- **📱 Deep Linking**: Users can bookmark and share specific workouts or exercises
- **🚀 Loading States**: Comprehensive loading indicators throughout the app

## 🗺️ App Structure

### Route Architecture

The app uses a route-based structure that enables proper navigation and PWA functionality:

#### `/` - Home Page

- **Purpose**: Entry point that redirects authenticated users to `/workouts`
- **Features**:
  - Shows authentication form for unauthenticated users
  - Automatically redirects to `/workouts` when user is logged in

#### `/workouts` - Workouts List

- **Purpose**: Display all workouts for the authenticated user
- **Features**:
  - View all workouts with exercise counts
  - Create new workouts
  - Edit workout names
  - Delete workouts with confirmation
  - Drag and drop to reorder workouts
  - Navigate to account settings
  - Click on workout to view details

#### `/workouts/[id]` - Workout Detail

- **Purpose**: Display exercises within a specific workout
- **Features**:
  - View all exercises in the workout with set counts
  - Create new exercises
  - Edit exercise names
  - Delete exercises with confirmation
  - Drag and drop to reorder exercises
  - Navigate back to workouts list
  - Click on exercise to view sets

#### `/workouts/[id]/exercises/[exerciseId]` - Exercise Detail (Sets)

- **Purpose**: Manage sets for a specific exercise
- **Features**:
  - View all sets with weight and reps
  - Create new sets
  - Edit existing sets inline
  - Delete sets with confirmation
  - Drag and drop to reorder sets
  - Navigate back to workout detail

#### `/account` - Account Settings

- **Purpose**: Manage user account and authentication
- **Features**:
  - View user profile information
  - Sign out functionality
  - Navigate back to workouts

### Navigation Flow

```
/ (Home)
├── /workouts (Workouts List)
│   ├── /workouts/[id] (Workout Detail)
│   │   └── /workouts/[id]/exercises/[exerciseId] (Exercise Sets)
│   └── /account (Account Settings)
```

### PWA Navigation Benefits

- **Back Navigation**: Each page supports browser back button and gesture navigation
- **Deep Linking**: Users can bookmark and share specific workouts or exercises
- **Offline Support**: All routes work offline with cached data
- **Mobile Optimized**: Swipe gestures and touch-friendly interface

### Data Management

- **Automatic Sync**: Changes are automatically synced to the server
- **Optimistic Updates**: UI updates immediately for better UX
- **Error Handling**: Graceful fallbacks for network issues
- **State Persistence**: Data persists across route changes

## 🛠️ Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern React component library
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icons

### Features & Interactions

- **[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)** - Drag and drop functionality
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Database & Backend

- **[Auth.js](https://authjs.dev/)** - Modern authentication with Google OAuth
- **[Upstash Redis](https://upstash.com/)** - Serverless Redis database with Auth.js adapter
- **Next.js API Routes** - Serverless backend functions

### PWA & Performance

- **[next-pwa](https://github.com/shadowwalker/next-pwa)** - PWA configuration
- **Service Workers** - Offline functionality and caching
- **Web App Manifest** - Native app-like installation

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Upstash Redis database (for data persistence and auth sessions)
- Google OAuth App (for authentication)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Neilsmahajan/workout-tracker-pwa.git
   cd workout-tracker-pwa
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Upstash Redis Configuration
   KV_REST_API_URL=your_upstash_redis_url
   KV_REST_API_TOKEN=your_upstash_redis_token

   # Auth.js Configuration
   AUTH_SECRET=your_auth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth Configuration
   AUTH_GOOGLE_ID=your_google_oauth_client_id
   AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
   ```

   **Setting up Google OAuth:**
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select existing one
   3. Enable Google+ API
   4. Create OAuth 2.0 credentials
   5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (development) and `https://your-domain.com/api/auth/callback/google` (production)

4. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 📱 Usage

### Getting Started

1. **Sign In with Google**: Authenticate using your Google account
2. **Create Workout**: Add a new workout with a custom name
3. **Add Exercises**: Add exercises to your workout
4. **Track Sets**: Record weight, reps, and track your progress
5. **Reorder**: Drag and drop to reorder workouts and exercises

### Key Features

- **Mobile Installation**: Use "Add to Home Screen" on mobile browsers
- **Offline Mode**: Continue tracking even without internet
- **Auto-Sync**: Data automatically syncs when connection is restored
- **Account Management**: Access your profile and logout from the account menu
- **Route Navigation**: Use browser back button or swipe gestures to navigate between pages
- **Deep Linking**: Bookmark specific workouts or exercises for quick access

## 🏗️ Project Structure

```
workout-tracker-pwa/
├── auth.ts                       # Auth.js configuration with Google OAuth
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Auth.js authentication endpoints
│   │   │   └── [...nextauth]/    # NextAuth.js dynamic route
│   │   │       └── route.ts      # Auth handlers
│   │   └── workouts/             # Workout data endpoints
│   │       └── route.ts          # Workout CRUD operations
│   ├── account/                  # Account management page
│   │   └── page.tsx              # Account settings and profile
│   ├── workouts/                 # Workout-related pages
│   │   ├── page.tsx              # Workouts list page
│   │   └── [id]/                 # Dynamic workout pages
│   │       ├── page.tsx          # Workout detail (exercises list)
│   │       └── exercises/        # Exercise-related pages
│   │           └── [exerciseId]/ # Dynamic exercise pages
│   │               └── page.tsx  # Exercise detail (sets management)
│   ├── fonts/                    # Custom fonts (Geist)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with PWA meta
│   ├── manifest.json/            # PWA manifest generator
│   │   └── route.ts              # Dynamic manifest
│   └── page.tsx                  # Home page with auth redirect
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── alert-dialog.tsx      # Alert dialog component
│   │   ├── alert.tsx             # Alert component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Dialog component
│   │   └── input.tsx             # Input component
│   ├── account-menu.tsx          # User account interface
│   └── auth-form.tsx             # Google OAuth authentication
├── lib/                          # Utilities and types
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets and PWA icons
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration with PWA
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Type Checking
pnpm type-check   # Run TypeScript compiler check
```

### Key Development Features

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety across the application
- **ESLint**: Code quality and consistency
- **Tailwind**: Utility-first styling with IntelliSense

## 🚀 Deployment

### Vercel (Recommended)

🌐 **Live Demo**: [https://workout-tracker-pwa-nu.vercel.app/](https://workout-tracker-pwa-nu.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Neilsmahajan/workout-tracker-pwa)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `NEXTAUTH_URL` (set to your production domain)
3. Deploy automatically on every push to main branch

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and TypeScript patterns
2. Add proper type definitions for new features
3. Test on mobile devices for PWA functionality
4. Ensure accessibility standards are maintained

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Neil Mahajan**

- Website: [https://neilsmahajan.com/](https://neilsmahajan.com/)
- GitHub: [@Neilsmahajan](https://github.com/Neilsmahajan)
- Email: neilsmahajan@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Auth.js](https://authjs.dev/) for secure authentication solutions
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vercel](https://vercel.com/) for deployment platform
- [Upstash](https://upstash.com/) for serverless Redis database
- [Google](https://developers.google.com/identity) for OAuth authentication

---

⭐ If you found this project helpful, please give it a star on GitHub!
