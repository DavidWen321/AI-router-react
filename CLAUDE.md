# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AiClaude is a web application for an AI programming assistant service, built as a SaaS platform with user management, API key management, and usage tracking. The application is bilingual (Chinese/English) and includes both user and admin dashboards.

## Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Fonts**: Geist Sans & Geist Mono
- **Analytics**: Vercel Analytics

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Directory Structure

- `app/` - Next.js app router pages and layouts
  - `dashboard/` - User dashboard pages
  - `dashboard/admin/` - Admin-only pages (users, keys, packages, number-pool)
  - `docs/`, `features/`, `pricing/` - Public marketing pages
- `components/` - React components
  - `ui/` - shadcn/ui components (78+ components)
  - Top-level components: Navigation, AuthModal, PricingPage, ThemeProvider
- `lib/` - Utilities and context providers
  - `language-context.tsx` - Bilingual support implementation
  - `utils.ts` - cn() utility for class merging
- `hooks/` - Custom React hooks (use-toast, use-mobile)

### State Management

- **Authentication**: Client-side using localStorage
  - `isLoggedIn`, `userEmail`, `isAdmin` stored in localStorage
  - Admin verification code: "000000" grants admin access
- **Language**: React Context (`LanguageProvider`) with `useLanguage()` hook
  - Toggle between "zh" (Chinese) and "en" (English)
  - Use `t()` function: `t("中文文本", "English text")`
- **Theme**: localStorage-based theme switching (light/dark)

### Key Features & Flows

#### Authentication Flow ([auth-modal.tsx](components/auth-modal.tsx))
1. User enters email → verification code sent
2. User enters 6-digit code
3. Code "000000" → admin access → redirects to `/dashboard/admin/users`
4. Any other code → regular user → redirects to `/dashboard`
5. Sets localStorage: `isLoggedIn`, `userEmail`, `isAdmin`

#### Navigation ([navigation.tsx](components/navigation.tsx))
- Responsive header with logo, nav links, language toggle, theme toggle
- Shows login/signup for guests
- Shows dashboard/admin link + logout for authenticated users
- Admin users redirect to `/dashboard/admin`, regular users to `/dashboard`

#### Admin Dashboard ([app/dashboard/admin/](app/dashboard/admin/))
- **Users page**: Full user management with CRUD operations, usage rate charts with time period filtering
- **Keys page**: API key management
- **Packages page**: Subscription package management
- **Number-pool page**: Phone number pool management
- Layout includes sidebar navigation

#### User Dashboard ([app/dashboard/page.tsx](app/dashboard/page.tsx))
- API key display with copy/download functionality
- Usage statistics cards (today's calls, monthly cost, plan type, etc.)
- Plan activation dialog
- Account information and plan management

### Styling Conventions

- Uses Tailwind with custom CSS variables for theming
- Path alias `@/` maps to root directory
- shadcn/ui components configured with "new-york" style
- Dark mode support with `dark:` classes
- Responsive breakpoints: `sm:`, `md:`, `lg:` prefixes

### Internationalization (i18n)

All user-facing text must use the translation function:
```typescript
const { t } = useLanguage()
t("中文文本", "English text")
```

Never hardcode user-facing strings. Always provide both Chinese and English versions.

### Component Patterns

- All pages are client components (`"use client"`) due to interactivity needs
- Use React hooks (useState, useEffect) for local state
- Use custom hooks from `hooks/` directory for shared logic
- Toast notifications via `useToast()` hook from [hooks/use-toast.ts](hooks/use-toast.ts)
- Icons from lucide-react library

### Data Handling

Currently using mock data with localStorage for demo purposes. Key data structures:

- **UserData** (admin users page): email, planType, planStatus, dailyBudget, todayUsage, totalUsage, totalCalls
- API keys are mock strings starting with "sk-"
- No backend API integration yet - all data is client-side

## Important Notes

- This is a client-side demo application without a real backend
- Authentication is simulated with localStorage
- Admin access granted via code "000000"
- All pricing, usage stats, and API keys are placeholder data
- The app uses Next.js App Router (not Pages Router)
- Component imports use `@/` path alias (configured in [tsconfig.json](tsconfig.json:22))
