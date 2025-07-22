# GALAX App Directory Structure
<!-- Updated 2025-07-19 15:56:42 UTC: Complete structure review and current state documentation -->

Below is a comprehensive overview of the GALAX App folder structure, reflecting the current implementation as of 2025-07-19 15:56:42 UTC:

## Main Application Structure

```
GALAX_App_files/
├── components.json                 # Shadcn/ui component configuration
├── IMPLEMENTATION_STATUS.md        # Current implementation progress and priorities
├── package.json                    # NPM dependencies and scripts (71 packages)
├── package-lock.json              # Dependency lock file
├── postcss.config.js              # PostCSS configuration for Tailwind
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript config for frontend
├── tsconfig.server.json           # TypeScript config for server
├── vite.config.js                 # Vite bundler configuration
├── client/                        # Frontend Application (6,466+ lines)
│   ├── index.html                 # Main HTML entry point
│   ├── public/                    # Static assets and PWA configuration
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── manifest.json          # PWA manifest
│   │   └── site.webmanifest
│   └── src/                       # React source code
│       ├── App.tsx                # Main app component with routing
│       ├── index.css              # Global styles and Tailwind imports
│       ├── main.tsx               # React entry point
│       ├── components/            # React components
│       │   ├── AnimatedBackground.tsx    # Dynamic background effects
│       │   ├── BottomNavigation.tsx      # Mobile navigation bar
│       │   ├── ChatInterface.tsx         # Real-time chat component
│       │   ├── EmailVerificationBanner.tsx  # Email verification UI
│       │   ├── MediaUpload.tsx           # File upload component
│       │   ├── OpenStreetMap.tsx         # Map integration
│       │   └── ui/                       # Reusable UI components (17 files)
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├── card.tsx
│       │       ├── checkbox.tsx
│       │       ├── command.tsx
│       │       ├── dialog.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── popover.tsx
│       │       ├── progress.tsx
│       │       ├── select.tsx
│       │       ├── slider.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── textarea.tsx
│       │       ├── toggle.tsx
│       │       └── tooltip.tsx
│       ├── contexts/              # React Context providers
│       │   └── AuthContext.tsx    # Authentication state management
│       ├── hooks/                 # Custom React hooks
│       │   └── useSocket.ts       # Socket.IO hook for real-time features
│       ├── lib/                   # Utility libraries
│       │   └── utils.ts           # Common utility functions
│       └── pages/                 # Application pages (10 pages)
│           ├── CrisisPage.tsx     # Emergency crisis management
│           ├── DashboardPage.tsx  # User dashboard and overview
│           ├── EmailVerificationPage.tsx  # Email verification flow
│           ├── ForgotPasswordPage.tsx     # Password reset request
│           ├── GovernancePage.tsx         # Democratic governance features
│           ├── HelpRequestsPage.tsx       # Community help system
│           ├── LoginPage.tsx              # User login
│           ├── ProfilePage.tsx            # User profile management
│           ├── RegisterPage.tsx           # User registration
│           └── ResetPasswordPage.tsx      # Password reset completion
├── data/                          # Database and file storage
│   ├── uploads/                   # User uploaded files
│   ├── database.sqlite           # Main SQLite database (249KB, 23 tables)
│   ├── database.sqlite-shm       # SQLite shared memory file
│   ├── database.sqlite-wal       # SQLite write-ahead log
│   └── database.sqlite.backup.*  # Database backup files
├── docs/                          # Comprehensive documentation (11 files)
│   ├── ADDITIONAL_BUGS_ANALYSIS.md
│   ├── ADVANCED_FEATURES_ASSESSMENT.md
│   ├── BETA_DEPLOYMENT_GUIDE.md
│   ├── COMPREHENSIVE_DEBUG_ANALYSIS.md
│   ├── COMPREHENSIVE_STATUS_ANALYSIS.md
│   ├── DEMOCRATIC_PARTICIPATION_SAFETY_ASSESSMENT.md
│   ├── FEATURE_COMPLETION_STATUS.md
│   ├── GAMIFIED_SOCIAL_NETWORK_ASSESSMENT.md
│   ├── PRE_BETA_CHECKLIST.md
│   ├── SOCIAL_IMPACT_INTEGRATION_ASSESSMENT.md
│   └── TECHNICAL_INTERFACE_DESIGN_ASSESSMENT.md
├── scripts/                       # Development and build scripts
│   └── dev.ts                     # Development server startup script
└── server/                        # Backend API and services (4,334+ lines)
    ├── index.ts                   # Main Express server and API routes
    ├── auth.ts                    # JWT authentication and authorization
    ├── database.ts                # Database connection and schema management
    ├── email.ts                   # Email verification and password reset
    ├── socketManager.ts           # Socket.IO real-time communication
    ├── debug.ts                   # Database debugging utilities
    ├── database-diagnostics.ts   # Database health monitoring
    ├── missing-endpoints.ts       # Placeholder for incomplete endpoints
    ├── startup-check.ts           # Server initialization validation
    ├── static-serve.ts           # Static file serving
    └── middleware/                # Express middleware modules
        ├── errorHandler.ts        # Global error handling
        ├── rateLimiter.ts        # API rate limiting
        ├── security.ts           # Security headers and input sanitization
        └── validation.ts         # Input validation schemas
```

## Database Schema (23 Tables)
<!-- Added 2025-07-19 15:56:42 UTC: Current database structure -->

The SQLite database contains 23 tables with proper relationships:

### Core Tables
- `users` - User accounts and profiles (6 records)
- `help_requests` - Community help system (2 records)
- `crisis_alerts` - Emergency alerts (0 records)
- `proposals` - Governance proposals (1 record)
- `votes` - Voting system (0 records)

### Communication & Social
- `messages` - Chat messages (0 records)
- `chat_rooms` - Chat room management (0 records)
- `notifications` - User notifications (0 records)
- `user_connections` - User relationships (0 records)

### Security & Verification
- `password_reset_tokens` - Password reset system
- `email_verification_tokens` - Email verification
- `phone_verification_tokens` - Phone verification (future)
- `passkey_credentials` - WebAuthn/passkey support
- `oauth_accounts` - OAuth integration

### Advanced Features
- `avatar_customizations` - Avatar system configuration
- `avatar_accessories` - Avatar accessories catalog
- `user_avatar_accessories` - User-owned accessories
- `avatar_animations` - Avatar animation system
- `user_avatar_animations` - User animation collection
- `kyc_verifications` - KYC verification system
- `address_verifications` - Address verification

### Governance & Economy
- `delegates` - Democratic delegation system
- `transactions` - Transaction history

## Technology Stack Summary
<!-- Added 2025-07-19 15:56:42 UTC: Technology overview -->

### Frontend (React + TypeScript)
- **Framework**: React 18.2.0 with TypeScript
- **Routing**: React Router DOM 7.6.3
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui components
- **Build Tool**: Vite 6.3.1
- **Real-time**: Socket.IO Client 4.8.1
- **Animation**: Framer Motion 12.23.6

### Backend (Node.js + Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.1.0
- **Database**: SQLite with Kysely query builder
- **Real-time**: Socket.IO 4.8.1
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, rate limiting, input validation
- **File Upload**: Multer for file handling

### Development & Build
- **Package Manager**: NPM (453 packages installed)
- **TypeScript**: v5.8.2 (compilation issues present)
- **Dev Server**: tsx for hot reloading
- **CSS Processing**: PostCSS + Autoprefixer

> **Note**: As of 2025-07-19 15:56:42 UTC, the TypeScript build has 47 compilation errors that need resolution, but the development server runs successfully. For more details and troubleshooting steps, please refer to the [TypeScript Compilation Errors Tracking Issue](https://github.com/actual-org/actual-repo/issues/456) or the [Troubleshooting Guide](https://docs.actual.com/troubleshooting-typescript-errors).
