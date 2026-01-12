# Life Manager

A comprehensive all-in-one solution for time management, finances, appointments, and habits. Organize your life, boost your productivity, and achieve your goals.

## ✨ Features

### 🕐 Time Tracker

- Precise time tracking for projects
- Detailed productivity analysis and reports
- Project management with tags and folder structure
- Real-time timer with pause functionality

### 📅 Calendar

- Centralized appointment management
- Seamless integration with Time Tracker
- Project-based planning

### 💰 Finances

- Income and expense management
- Link income with projects
- Bank account management
- Recurring cashflows
- Contacts and payouts
- Financial overviews and charts

### 🎯 Habit Tracker

- Track daily habits
- Progress visualization
- Goal setting and tracking

### 🚀 Additional Features

- **Offline-First**: Full offline functionality with PowerSync
- **PWA**: Installable as Progressive Web App
- **Dark/Light Mode**: Automatic theme switching
- **Internationalization**: German and English
- **Real-time Sync**: Automatic synchronization with Supabase
- **Responsive Design**: Optimized for all devices

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) v1.3.3+
- **Framework**: [TanStack Start](https://tanstack.com/start) (React Router SSR)
- **UI Library**: [Mantine](https://mantine.dev) v8
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Sync**: [PowerSync](https://powersync.com) for offline sync
- **State Management**: Zustand, TanStack Query
- **Language**: TypeScript
- **Build Tool**: Vite
- **Icons**: Tabler Icons
- **Charts**: Recharts, Mantine Charts
- **Monitoring**: Sentry, Vercel Analytics

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.3.3 or higher
- Node.js (for some build tools)
- Supabase account and project
- PowerSync account (optional, for offline sync)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd life_manager
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=your_powersync_url
```

4. **Run Supabase migrations**

```bash
# Migrations are located in supabase/migrations/
# Run these in your Supabase Dashboard or use the Supabase CLI
```

## 💻 Development

### Start development server

```bash
bun run dev
```

The application will run on `http://localhost:3000`

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Create production build
- `bun run start` - Start production server
- `bun run lint` - Run TypeScript and ESLint checks
- `bun run lint:fix` - Automatically fix linting issues
- `bun test` - Run tests
- `bun test:watch` - Run tests in watch mode

## 🏗️ Build & Deployment

### Create production build

```bash
bun run build
```

The build will be created in the `dist/` directory.

### Start production server

```bash
bun run start
```

## 📁 Project Structure

```
life_manager/
├── src/
│   ├── actions/          # Server Actions
│   ├── components/       # React Components
│   │   ├── AppShell/     # Layout Components
│   │   ├── Finances/     # Finance Module
│   │   ├── TimeTracker/  # Time Tracker Module
│   │   ├── Work/         # Work/Project Module
│   │   ├── WorkCalendar/ # Calendar Module
│   │   └── UI/           # Reusable UI Components
│   ├── db/               # Database Collections & PowerSync
│   ├── hooks/            # Custom React Hooks
│   ├── lib/              # Utility Functions
│   ├── routes/           # TanStack Router Routes
│   ├── stores/           # Zustand Stores
│   ├── types/            # TypeScript Type Definitions
│   └── utils/            # Utility Functions
├── supabase/
│   ├── migrations/       # Database Migrations
│   └── seeds/           # Seed Data
├── public/              # Static Assets
└── dist/                # Build Output
```

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project
2. Run the migrations (`supabase/migrations/`)
3. Configure Row Level Security (RLS) policies
4. Set the environment variables

### PowerSync Setup

1. Create a PowerSync account
2. Connect PowerSync with your Supabase project
3. Configure sync rules
4. Set the PowerSync URL in environment variables

## 📝 Code Style

- TypeScript Strict Mode
- ESLint for code quality
- React Compiler for optimized renders
- Comments in English
- Mantine Components for UI

## 🤝 Contributing

Contributions are welcome! Please create a Pull Request with a detailed description of your changes.

## 📄 License

[Add license here]

## 🔗 Links

- [Bun Documentation](https://bun.sh/docs)
- [TanStack Start Documentation](https://tanstack.com/start)
- [Mantine Documentation](https://mantine.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [PowerSync Documentation](https://docs.powersync.com)

---

**Built with ❤️, Tanstack, Bun and Mantine**
