# 💪 Workout Tracker PWA

A modern Progressive Web App (PWA) for tracking workouts, exercises, and sets. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring a clean mobile-first design with offline capabilities and real-time data synchronization.

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

- **🔐 User Authentication**: Secure login and signup system
- **👤 Account Management**: User profile and settings
- **🎯 Intuitive Navigation**: Clean, simple interface with minimal learning curve
- **⚡ Fast Performance**: Optimized for speed and smooth interactions
- **🌙 Modern UI**: Beautiful design with shadcn/ui components

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

- **[Upstash Redis](https://upstash.com/)** - Serverless Redis database
- **Next.js API Routes** - Serverless backend functions

### PWA & Performance

- **[next-pwa](https://github.com/shadowwalker/next-pwa)** - PWA configuration
- **Service Workers** - Offline functionality and caching
- **Web App Manifest** - Native app-like installation

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Upstash Redis database (for data persistence)

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
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

   # Optional: Add other environment variables as needed
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

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

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Create Workout**: Add a new workout with a custom name
3. **Add Exercises**: Add exercises to your workout
4. **Track Sets**: Record weight, reps, and track your progress
5. **Reorder**: Drag and drop to reorder workouts and exercises

### Key Features

- **Mobile Installation**: Use "Add to Home Screen" on mobile browsers
- **Offline Mode**: Continue tracking even without internet
- **Auto-Sync**: Data automatically syncs when connection is restored
- **Account Management**: Access your profile and logout from the account menu

## 🏗️ Project Structure

```
workout-tracker-pwa/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   └── signup/
│   │   └── workouts/             # Workout data endpoints
│   ├── fonts/                    # Custom fonts (Geist)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with PWA meta
│   ├── manifest.json/            # PWA manifest generator
│   └── page.tsx                  # Main application component
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── account-menu.tsx          # User account interface
│   └── auth-form.tsx             # Authentication forms
├── lib/                          # Utilities and types
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
│   ├── icons/                    # PWA icons and splash screens
│   └── manifest files
└── configuration files           # Next.js, TypeScript, Tailwind config
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Neilsmahajan/workout-tracker-pwa)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
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
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vercel](https://vercel.com/) for deployment platform
- [Upstash](https://upstash.com/) for serverless Redis database

---

⭐ If you found this project helpful, please give it a star on GitHub!
