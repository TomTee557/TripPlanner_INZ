# 🌍 Trip Planner - Full Stack Application

Modern web application for comprehensive trip planning with budget tracking, packing lists, and task management. Built with a complete TypeScript stack and Docker containerization.

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
  - [Authentication](#authentication-endpoints)
  - [Trips](#trips-endpoints)
  - [Expenses](#expenses-endpoints)
  - [Packing List](#packing-list-endpoints)
  - [Todos](#todo-endpoints)
  - [Invitations & Notifications](#invitations--notifications-endpoints)
  - [Comments (Group Messages)](#comments-group-messages-endpoints)
  - [Documents](#documents-endpoints)
  - [Admin](#admin-endpoints)
  - [Profile](#profile-endpoints)
  - [AI Smart Packing](#ai-endpoints)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## 🎯 Project Overview

**Trip Planner** is a full-stack web application designed to help users organize and manage their trips efficiently. The application provides a complete solution for trip planning, including expense tracking with currency conversion, packing list management, and todo task organization. Built with modern technologies and best practices, it offers a seamless user experience with robust authentication and real-time session management.

### Key Capabilities:
- User authentication with JWT tokens and automatic session refresh
- Multi-trip management with various trip types (Business, Leisure, Adventure, etc.)
- Real-time expense tracking with multi-currency support
- Interactive packing list with progress tracking
- Task management with priority levels and due dates
- Visual **Budget Overview** — pie chart of expenses per trip, per-trip budget vs. spent progress bars, live currency conversion via the NBP API
- Responsive design for desktop and mobile devices

---

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure authentication with bcrypt password hashing
- **JWT Token Management** - Stateless authentication with 15-minute token expiration
- **Automatic Session Refresh** - Smart session timer with 30-second warning before expiration
- **Protected Routes** - Frontend and backend route protection with automatic redirect to login
- **HTTP Security Headers (Helmet)** - Express `helmet` middleware sets security-relevant response headers on every request: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, and others — protecting against clickjacking, MIME-type sniffing, and XSS injection
- **Rate Limiting** - Login and registration endpoints are limited to **10 failed attempts per 15-minute window per IP** via `express-rate-limit`. Successful requests (`2xx`) are not counted. After the limit is reached the server responds with HTTP **429** and a human-readable message: `"Too many failed attempts, please try again in 15 minutes"`
- **Password Validation** - Registration enforces a minimum password length of **6 characters**, validated on both the frontend (inline error under the password field before the request is sent) and the backend (400 response if not met)
- **Self-Service Account Deletion** - Users can delete their own account from the Settings tab (Danger Zone section). Blocked with a clear error message if the user owns any group trips with accepted participants. On success all owned solo trips, expenses/comments in other trips, participant records, documents, and notifications are removed via Prisma CASCADE.
- **Admin-Forced Account Deletion** - Admin panel can delete any user; the system automatically transfers ownership of group trips (earliest accepted participant becomes the new owner and is removed from participants list) before the account is removed

### 🗺️ Trip Management
- **Create Multiple Trips** - Organize different trips with custom names, descriptions, and dates
- **Trip Types** - Categorize trips (Business, Leisure, Adventure, Beach, Mountain, City, Cultural, Safari, Cruise, Road Trip, Family, Backpacking, Luxury, Budget)
- **Trip Filtering** - Search and filter trips by type, date range, or destination
- **Archive Filter** - Filter trips to show All / Archive only (past trips) / No archive (future trips) via a dedicated dropdown in the search panel
- **Trip Images** - Visual representation with predefined trip images
- **Multi-Currency Budget** - Budget is set per trip with a currency selector (13 currencies supported: PLN, USD, EUR, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, CZK, HUF). Stored as symbol + amount string (e.g. `€2500.00`, `$1200.00`). The inline 💱 button in the form opens the Currency Converter for reference.
- **Update & Delete** - Full CRUD operations on trips; edit button restricted to owners only

### 👥 Group Trips & Invitations
- **Multi-Participant Trips** - Invite other registered users to join a trip as participants
- **Invitation Flow** - Owner sends invitations (PENDING) → Participants accept or decline → Owner sees confirmations → Group badge appears on card
- **Role-Based Access** - Trip owner can edit/delete the trip; participants can only view content and leave
- **Leave Trip** - Participants can leave a group trip at any time; their expenses, packing items, and todos are removed
- **Owner Delete with Notifications** - When the owner deletes a group trip, all accepted participants automatically receive a TRIP_DELETED system notification
- **Transfer Ownership** - Before deleting a group trip the owner is offered a choice: transfer ownership to one of the accepted participants (the new owner takes over, the old owner leaves the trip) or delete the trip for everyone; a dedicated dialog with a participant dropdown makes the flow explicit
- **Private Items** - Expenses, packing items, and todos can be marked as private (visible only to their author in group trips)
- **Participant Panel** - Dedicated panel showing all current participants with their status
- **Group Badge** - Visual indicator on trip cards distinguishing role: `"Group trip — owner"` badge for the trip creator, `"Group trip"` badge for participants
- **Group Filter Dropdown** - Search panel dropdown replaces the old checkbox: filter by *All trips* / *Group trips only* / *Group trips I own* / *Solo trips only*

### 🔔 Notifications & Messaging
- **Notification Badge** - Live counter in the UI header showing total pending actions (`⚙ Settings` button)
- **Automatic Polling** - Notification count refreshed automatically every 2 minutes and on login
- **Invitations Tab** - Dedicated account settings tab with four sections:
  - **Received** — incoming invitations awaiting response (Accept / Decline)
  - **Sent** — outgoing PENDING invitations I sent as owner
  - **Confirmations** — ACCEPTED/REJECTED responses from my invitees (with "Mark as read")
  - **Messages** — LEFT, TRIP_DELETED, and TRIP_COMMENT notifications
- **Clear Read** - One-click cleanup button removes all acted-on invitations and read notifications from the database; appears only when there is something to clear

### 💬 Group Messages (Trip Comments)
- **In-Trip Chat** — Every group trip has a built-in messages panel inside the trip form (edit mode for owner, read-only view for participants)
- **Chat-Style UI** — Own messages appear on the right (blue bubble), others on the left (white bubble with avatar initials and author name)
- **Date & Time** — Each message shows the exact date and time it was written (`dd.mm.yyyy hh:mm`)
- **Scrollable History** — Messages list has its own scroll with a max height of 340px, keeping the form compact
- **Delete Message** — Comment author and trip owner can delete any message (× button next to timestamp)
- **TRIP_COMMENT Notifications** — After sending a message, every other accepted participant and the trip owner receive a `TRIP_COMMENT` system notification visible in the Messages section of the Invitations tab (💬 icon, "New message" label)
- **View Details Button** — Non-owner participants have a dedicated "Details" button on the trip card that opens the read-only trip form with the messages panel

### 💰 Expense Tracking
- **Multi-Currency Support** - Track expenses in USD, EUR, GBP, PLN, and more
- **Expense Categories** - Pre-defined categories (Accommodation, Food & Dining, Transportation, Activities & Entertainment, Shopping, Health & Medical, Communication, Miscellaneous)
- **Expense Details** - Record amount, currency, description, and date for each expense
- **Total Calculation** - Automatic calculation of total expenses per currency
- **CRUD Operations** - Add, edit, view, and delete expenses

### 📦 Packing List Management
- **Categorized Items** - Organize items by category (Clothing, Toiletries, Electronics, Documents, Health & Medical, Outdoor Gear, Food & Snacks, Entertainment, Other)
- **Quantity Tracking** - Specify quantity for each item
- **Priority Levels** - Set priority (High, Medium, Low) for items
- **Pack Status** - Mark items as packed with visual progress tracking
- **Progress Bar** - Real-time visual feedback on packing completion

### ✅ Todo List & Task Management
- **Task Organization** - Create and manage trip-related tasks
- **Priority System** - Assign priority levels (High, Medium, Low) to tasks
- **Due Dates** - Set and track task deadlines
- **Completion Tracking** - Mark tasks as completed with progress visualization
- **Overdue Detection** - Automatic detection and highlighting of overdue tasks

### 🪪 Travel Documents
- **Document Storage** - Store passports, visas, ID cards, insurance, vaccination cards, driving licences, and other documents
- **Expiry Tracking** - Each document shows its expiration date with colour-coded status: green (valid), orange (expiring soon), red (expired)
- **Smart Warning Thresholds** - Important document types (Passport, ID Card, Visa, Insurance, Vaccination Card, Driving License) trigger a warning 6 months before expiry; other types warn 30 days before
- **Badge on Settings** - Orange `!` badge appears on the ⚙ Settings button in the navbar whenever at least one document is within its warning window
- **Badge on Documents Tab** - The Documents tab inside Account Settings shows the same orange `!` badge so the user knows where to look
- **Full CRUD** - Add, edit (inline form per row), and delete documents; all operations refresh the expiry badge immediately

### 📊 Budget Overview
- **Single-Request Summary** - `GET /api/trips/budget-summary` fetches all trips and their visible expenses in one round-trip, avoiding N individual expense requests
- **Pie Chart** - SVG pie chart showing the share of total spending per trip with a colour-coded legend. Two modes selectable via a dropdown: **Expenses (spent)** — visualises how much has actually been spent per trip; **Budget (planned)** — visualises the planned budget allocation per trip. Zero-value slices are skipped so the chart always renders correctly
- **Budget vs Expenses Progress Bars** - Per-trip horizontal bar (blue = within budget, red = over budget) showing spent / budget ratio; ⚠️ icon and "Over by" label when exceeded
- **Live Currency Conversion** - Dropdown with 13 currencies; amounts are converted in real time using the [NBP exchange rate API](https://api.nbp.pl); fallback warning shown if the API is unreachable
- **Smart Budget Parsing** - Budget strings like `€3,800`, `$1,200.50`, `2500 PLN`, `zł600.00` are parsed with a tolerant regex that handles thousands separators (`,` or `.`), currency symbols, and currency codes
- **Toggle Button** - "My Budget" / "My Trips" button (always solid blue) in the header switches between the trips list and the budget view; tooltips guide the user

### 🎨 User Experience
- **Custom Notifications** - Non-intrusive error notifications with auto-close (5 seconds)
- **Confirmation Dialogs** - Custom confirmation popups for destructive actions
- **Session Warning Dialog** - User-friendly countdown dialog before logout
- **Responsive Design** - Mobile-first approach with SCSS styling
- **Loading States** - Smooth loading indicators for async operations
- **Error Handling** - Comprehensive error messages from backend API

### 🤖 AI Smart Packing (feature-gated)
- **Permission-Based Access** — Only users with the `SMART_PACKING` permission (granted by an admin) see the Smart Pack button on the trip form
- **Contextual Questions Modal** — Before calling the AI, users answer a short set of optional questions across two steps: activities (chip selection + free-text "other" field), city / region (for precise climate inference), accommodation type, transport to destination (Plane, Train, Car, Bus, Boat, Motorbike), and transport around destination (Rental car, Public transport, Taxi, Bicycle, Walking, Motorbike, Boat)
- **Practical AI Output** — Uses OpenAI `gpt-4o-mini` to generate four sections saved directly to the trip:
  - **Packing list** (10–25 items with category, quantity, and priority) — climate-aware and activity-specific
  - **Pre-trip todo list** (5–10 tasks) — includes visa check for the user's nationality, vaccination advice, and booking reminders
  - **Estimated expenses** (4–10 entries) — realistic cost estimates including transport, accommodation, food, and activities
  - **Trip note** — 3–5 sentences of practical advice: inferred weather, visa/entry requirements, dietary warnings, must-see attractions, and health recommendations
- **Nationality-Aware** — User's nationality (stored in profile) is sent to the AI to personalise visa and passport validity advice
- **Language Selection** — Response language follows the "Polish / English" selector in the modal
- **Validation** — Smart Pack button is always visible; clicking validates that Title, Country, Dates, Budget, and Trip Type are filled before opening the modal; missing fields surface as a dark tooltip above the button
- **Admin Management** — Admin panel lists and toggles `SMART_PACKING` per user via a checkbox UI

### 👤 User Profile
- **About Me Tab** — Users can set and update their **Birthday** (date picker) and **Nationality** (text field) from Account Settings → About Me; both fields are saved in a single request
- **Nationality for AI** — Nationality is stored in the DB and passed to the AI Smart Packing prompt to generate nationality-specific visa and passport advice

---

## 🛠️ Technology Stack

### Frontend

#### **React 19.2** 
Modern UI library for building component-based interfaces.
- **Why:** Declarative programming model, component reusability, large ecosystem, excellent performance with Virtual DOM, and industry standard for SPAs.

#### **TypeScript 5.9**
Strongly-typed superset of JavaScript.
- **Why:** Provides compile-time type checking, better IDE support with IntelliSense, reduces runtime errors, improves code maintainability, and enables better refactoring capabilities.

#### **Redux Toolkit 2.11**
State management library with simplified Redux patterns.
- **Why:** Predictable state container for complex applications, centralized state management, excellent DevTools for debugging, reduces boilerplate compared to vanilla Redux, and provides built-in best practices.

#### **Redux Saga 1.4**
Middleware for handling side effects in Redux.
- **Why:** Declarative effects management, better testability for async operations, powerful control flow with generators, and separation of business logic from components.

#### **React Router DOM 7.12**
Declarative routing library for React.
- **Why:** Industry-standard routing solution, supports dynamic routes, protected routes, programmatic navigation, and excellent integration with React.

#### **Axios 1.13**
Promise-based HTTP client for browser and Node.js.
- **Why:** Interceptors for request/response transformation, automatic JSON transformation, better error handling than fetch, request/response cancellation, and widespread community support.

#### **SCSS/Sass 1.97**
CSS preprocessor with enhanced features.
- **Why:** Variables, nesting, mixins for code reusability, better organization with partials, follows BEM methodology, and compiles to optimized CSS.

#### **Vite 7.2**
Next-generation frontend build tool.
- **Why:** Lightning-fast cold start with native ES modules, instant Hot Module Replacement (HMR), optimized production builds, out-of-the-box TypeScript support, and significantly faster than Webpack.

### Backend

#### **Node.js 18+**
JavaScript runtime built on Chrome's V8 engine.
- **Why:** Non-blocking I/O for high performance, unified JavaScript across frontend and backend, massive npm ecosystem, and excellent for real-time applications.

#### **Express 4.19**
Minimalist web framework for Node.js.
- **Why:** Simple and flexible, robust middleware system, extensive community support, perfect for RESTful APIs, and mature ecosystem with countless plugins.

#### **TypeScript 5.9**
(Same as frontend)
- **Why:** Type safety across the entire stack, shared types between frontend and backend, better documentation through types, and reduces integration bugs.

#### **Prisma 5.20**
Next-generation ORM (Object-Relational Mapping).
- **Why:** Type-safe database client generated from schema, intuitive API for database operations, excellent migration system, auto-completion in IDE, supports multiple databases, and modern declarative approach to database modeling.

#### **PostgreSQL 16**
Advanced open-source relational database.
- **Why:** ACID compliance for data integrity, powerful query capabilities, excellent performance, JSON support for flexibility, robust constraint system, and highly reliable for production.

#### **JWT (jsonwebtoken 9.0)**
JSON Web Token implementation for authentication.
- **Why:** Stateless authentication, scalable across multiple servers, industry standard, compact and URL-safe, includes expiration handling, and perfect for modern SPAs.

#### **bcrypt 5.1**
Password hashing library.
- **Why:** Industry-standard for password hashing, built-in salt generation, adjustable computational cost, protects against rainbow table attacks, and prevents timing attacks.

#### **Helmet 8.x**
Express middleware for setting HTTP security headers.
- **Why:** Automatically adds headers such as `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security` to protect the API against common web vulnerabilities (clickjacking, MIME-type sniffing, XSS) with a single `app.use(helmet())` call.

#### **express-rate-limit 7.x**
Rate-limiting middleware for Express.
- **Why:** Protects authentication endpoints against brute-force and credential-stuffing attacks by limiting the number of failed requests per IP. Only failed requests count toward the limit (`skipSuccessfulRequests: true`), avoiding false positives for legitimate users.

### Infrastructure & DevOps

#### **Docker & Docker Compose**
Containerization platform.
- **Why:** Consistent development environments across team members, easy deployment, isolated dependencies, reproducible builds, simplified database setup, and industry-standard for modern DevOps.

#### **pgAdmin 4**
Web-based database administration tool.
- **Why:** Visual database management, query building interface, schema visualization, included in Docker setup for easy access, and helpful for debugging and monitoring.

### Development Tools

#### **ESLint 9.39**
JavaScript/TypeScript linter.
- **Why:** Enforces code quality standards, catches bugs before runtime, customizable rules, integrates with IDE, and maintains consistent code style across team.

#### **Nodemon 3.1**
Development tool for auto-restarting Node.js applications.
- **Why:** Watches file changes and auto-restarts server, speeds up development workflow, configurable watch patterns, and improves developer productivity.

#### **ts-node 10.9**
TypeScript execution engine for Node.js.
- **Why:** Run TypeScript directly without compiling, faster development iteration, perfect for development environment, and simplifies debugging.

---

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **Git** ([Download](https://git-scm.com/))

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd ZDPAI-Project
```

#### 2. Start the Database with Docker

First, start the PostgreSQL database and pgAdmin using Docker Compose:

```bash
# Start the database container in detached mode
docker-compose up -d

# Verify containers are running
docker ps
```

This will start:
- **PostgreSQL** database on port `5433`
- **pgAdmin** web interface on port `5050`

**Access pgAdmin:**
- URL: `http://localhost:5050`
- Email: `admin@example.com`
- Password: `admin`

#### 3. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server

# Install all dependencies
npm install

# Generate Prisma Client from schema
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

Create a `.env` file in the `server` directory with the following content:

```env
# Database
DATABASE_URL="postgresql://docker:docker@localhost:5433/trip_planner?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=15m

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# OpenAI (required for AI Smart Packing)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

**Start the backend server:**

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

**Backend will be available at:** `http://localhost:3000`

#### 4. Frontend Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client

# Install all dependencies
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

**Start the frontend development server:**

```bash
# Development mode with hot reload
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

#### 5. Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the login/registration page
3. Register a new account
4. After login, you'll be redirected to the main application

---

## 📁 Project Structure

```
ZDPAI-Project/
│
├── server/                          # Backend - Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller.ts   # Authentication logic
│   │   │   ├── trips.controller.ts  # Trip CRUD operations
│   │   │   ├── expenses.controller.ts
│   │   │   ├── packing.controller.ts
│   │   │   ├── todos.controller.ts
│   │   │   ├── invitations.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── comments.controller.ts  # Group trip messages
│   │   │   ├── admin.controller.ts  # Admin: users, roles, permissions
│   │   │   ├── profile.controller.ts   # User profile (birthday, nationality)
│   │   │   └── ai.controller.ts     # AI Smart Packing (OpenAI)
│   │   │
│   │   ├── routes/                  # API route definitions
│   │   │   ├── auth.routes.ts       # /api/auth/*
│   │   │   ├── trips.routes.ts      # /api/trips/*
│   │   │   ├── expenses.routes.ts
│   │   │   ├── packing.routes.ts
│   │   │   ├── todos.routes.ts
│   │   │   ├── participants.routes.ts
│   │   │   ├── invitations.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── comments.routes.ts   # /api/trips/:tripId/comments/*
│   │   │   ├── admin.routes.ts      # /api/admin/*
│   │   │   ├── profile.routes.ts    # /api/profile/*
│   │   │   └── ai.routes.ts         # /api/ai/*
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts       # JWT verification
│   │   │   ├── authorization.middleware.ts  # requireAdmin, requireOwnerOrAdmin
│   │   │   ├── error.middleware.ts      # Error handling
│   │   │   └── validation.middleware.ts
│   │   │
│   │   ├── config/                  # Configuration files
│   │   │   └── database.ts          # Prisma client setup
│   │   │
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── index.ts             # Shared types
│   │   │
│   │   └── index.ts                 # Server entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # Database migrations
│   │   └── seed.ts                  # Seed data
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── client/                          # Frontend - React + TypeScript + Redux
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── common/              # Reusable components
│   │   │   │   ├── ErrorNotification/
│   │   │   │   ├── ConfirmDialog/
│   │   │   │   └── RefreshSessionDialog/
│   │   │   │
│   │   │   └── trips/               # Feature components
│   │   │       ├── TripsList/
│   │   │       ├── TripCard/
│   │   │       ├── ExpensesList/
│   │   │       ├── PackingList/
│   │   │       └── TodoList/
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── AuthPage.tsx         # Login/Register
│   │   │   └── MainAppPage.tsx      # Main app (trips view)
│   │   │
│   │   ├── store/                   # Redux store
│   │   │   ├── index.ts             # Store configuration
│   │   │   ├── slices/              # Redux Toolkit slices
│   │   │   │   ├── authSlice.ts
│   │   │   │   └── tripsSlice.ts
│   │   │   └── sagas/               # Redux Saga effects
│   │   │       ├── rootSaga.ts
│   │   │       └── tripsSaga.ts
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── api.ts               # Axios instance + interceptors
│   │   │   ├── auth.service.ts
│   │   │   ├── trips.service.ts
│   │   │   ├── expenses.service.ts
│   │   │   ├── packing.service.ts
│   │   │   ├── todos.service.ts
│   │   │   ├── account.service.ts   # Profile, invitations, notifications
│   │   │   ├── comments.service.ts  # Group trip messages
│   │   │   └── ai.service.ts        # AI Smart Packing
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useSessionTimer.ts   # Session management
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.ts         # App constants
│   │   │   └── helpers.ts           # Helper functions
│   │   │
│   │   ├── styles/                  # Global styles
│   │   │   └── global.scss
│   │   │
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # App entry point
│   │   └── vite-env.d.ts
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── docker/                          # Docker configurations
│   ├── db/
│   │   └── Dockerfile               # PostgreSQL image
│   └── nginx/                       # (Future: Nginx reverse proxy)
│
├── database/
│   └── init.sql                     # Initial database setup
│
├── docker-compose.yaml              # Container orchestration
├── README.md                        # This file
└── .gitignore

```

---

## 📡 API Documentation

### Interactive Swagger Documentation

The API includes full **Swagger/OpenAPI** documentation available at:

**URL:** `http://localhost:3000/api-docs`

The Swagger UI provides:
- ✅ Interactive API testing directly from the browser
- ✅ Complete request/response schemas
- ✅ Authentication token management
- ✅ Example requests and responses
- ✅ Real-time API exploration

**To access:**
1. Start the backend server (`npm run dev` in the `server` directory)
2. Open your browser and navigate to `http://localhost:3000/api-docs`
3. Click "Authorize" and enter your JWT token (get one by logging in first)
4. Test any endpoint directly from the interface

---

### Authentication Endpoints

#### **POST** `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John",
  "surname": "Doe",
  "password": "password123",
  "nationality": "Polish",
  "birthday": "1995-06-15"
}
```

> `nationality` and `birthday` are optional. `password` must be at least **6 characters**. New accounts start with **no permissions** — `SMART_PACKING` must be granted explicitly by an admin.

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 7,
    "email": "user@example.com",
    "name": "John",
    "surname": "Doe"
  }
}
```

**Response `429` — rate limit exceeded:**
```json
{ "error": "Too many requests", "message": "Too many failed attempts, please try again in 15 minutes" }
```

#### **POST** `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 7,
    "email": "user@example.com",
    "name": "John",
    "surname": "Doe",
    "role": "USER",
    "permissions": ["SMART_PACKING"]
  }
}
```

> `permissions` is an array of feature flags (`"SMART_PACKING"` or empty) used by the frontend to conditionally show premium features.

**Response `429` — rate limit exceeded:**
```json
{ "error": "Too many requests", "message": "Too many failed attempts, please try again in 15 minutes" }
```

> The rate limiter allows **10 failed attempts per 15 minutes per IP**. Successful logins (`200`) are not counted toward the limit.

#### **POST** `/api/auth/refresh`
Refresh JWT token (requires valid token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

#### **DELETE** `/api/auth/account`
Permanently delete the currently authenticated user's own account (self-service).

Blocked with **409 Conflict** when the user is the owner of any group trip that has at least one `ACCEPTED` participant — those trips must be transferred or deleted first. On success Prisma CASCADE removes all owned solo trips, the user's expenses/comments in other trips, participant records, documents, and notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Success response `200`:**
```json
{ "success": true, "message": "Account deleted successfully" }
```

**Blocked response `409`:**
```json
{
  "error": "Cannot delete account",
  "message": "You cannot delete your account while you are the owner of group trip(s): \"Summer in Greece\". Please transfer ownership or delete those trips first."
}
```

### Trips Endpoints

All trip endpoints require authentication (JWT token in Authorization header).

#### **GET** `/api/trips/budget-summary`
Get all trips (owned + accepted participant) with their expenses, optimised for the Budget Overview. Returns a single response instead of N individual expense fetches.

> ⚠️ This route is registered **before** `GET /api/trips/:id` in the router so the literal path `budget-summary` is not matched as `:id`.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Summer in Greece",
      "budget": "€2500.00",
      "dateFrom": "2026-07-01",
      "dateTo": "2026-07-15",
      "expenses": [
        { "id": "uuid", "amount": 45.50, "currency": "EUR" },
        { "id": "uuid", "amount": 120.00, "currency": "USD" }
      ]
    }
  ]
}
```

#### **GET** `/api/trips`
Get all trips for authenticated user.

#### **GET** `/api/trips/:id`
Get single trip by ID.

#### **POST** `/api/trips`
Create new trip.

#### **PUT** `/api/trips/:id`
Update existing trip.

#### **DELETE** `/api/trips/:id`
Delete trip (owner) or leave trip (participant). When the owner deletes a trip that has accepted participants the frontend shows the `TransferOwnerDialog` first.

**Budget format note:** the `budget` field is stored and returned as a currency-symbol + amount string, e.g. `€2500.00`, `$1200.00`, `zł800.00`. Use `budget.replace(/[^\d.]/g, '')` on the frontend to extract the numeric value.

#### **PUT** `/api/trips/:id/transfer-owner`
Transfer trip ownership to an accepted participant. Atomically updates the owner field, removes the new owner's participant record, and removes any stale participant record of the old owner. Only the current owner can call this endpoint.

**Request Body:**
```json
{ "newOwnerId": 5 }
```

**Response:**
```json
{ "success": true, "message": "Ownership transferred successfully" }
```

### Expenses Endpoints

#### **GET** `/api/trips/:tripId/expenses`
Get all expenses for a trip.

#### **POST** `/api/trips/:tripId/expenses`
Create new expense.

#### **PUT** `/api/trips/:tripId/expenses/:id`
Update expense.

#### **DELETE** `/api/trips/:tripId/expenses/:id`
Delete expense.

### Packing List Endpoints

#### **GET** `/api/trips/:tripId/packing-items`
Get all packing items.

#### **POST** `/api/trips/:tripId/packing-items`
Create packing item.

#### **PATCH** `/api/trips/:tripId/packing-items/:id/toggle`
Toggle packed status.

#### **DELETE** `/api/trips/:tripId/packing-items/:id`
Delete packing item.

### Todo Endpoints

#### **GET** `/api/trips/:tripId/todos`
Get all todo items.

#### **POST** `/api/trips/:tripId/todos`
Create todo item.

#### **PATCH** `/api/trips/:tripId/todos/:id/toggle`
Toggle completed status.

#### **DELETE** `/api/trips/:tripId/todos/:id`
Delete todo item.

### Invitations & Notifications Endpoints

All endpoints require authentication (JWT token in Authorization header).

#### **GET** `/api/invitations`
Returns four arrays for the authenticated user. Called when the user opens the Invitations tab or clicks "Refresh Now".

**Response:**
```json
{
  "success": true,
  "data": {
    "received": [ /* PENDING invitations I received */ ],
    "sent": [ /* PENDING invitations I sent as owner */ ],
    "confirmations": [ /* ACCEPTED/REJECTED responses on my trips */ ],
    "messages": [
      {
        "id": "uuid",
        "source": "participant",
        "type": "LEFT",
        "tripTitle": "Summer Vacation",
        "detail": "John Smith (john@example.com) left your trip.",
        "seen": false,
        "createdAt": "2026-04-18T10:00:00.000Z"
      }
    ]
  }
}
```

#### **GET** `/api/invitations/notifications`
Returns numeric counts for the notification badge. Polled every 2 minutes and on login.

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingReceived": 1,
    "unseenResponses": 2,
    "unseenNotifications": 0,
    "total": 3
  }
}
```

#### **PUT** `/api/invitations/:id/accept`
Accept a received invitation. Sets `status=ACCEPTED` and `ownerSeen=false`.

#### **PUT** `/api/invitations/:id/decline`
Decline a received invitation. Sets `status=REJECTED` and `ownerSeen=false`.

#### **PUT** `/api/invitations/:id/confirm`
Trip owner acknowledges an ACCEPTED, REJECTED, or LEFT response. Sets `ownerSeen=true`.

#### **DELETE** `/api/invitations/clear-read`
Permanently deletes all acted-on invitations and read notifications. Only removes records that are safe to delete (REJECTED invitations, LEFT/REJECTED confirmations seen by owner, seen TRIP_DELETED notifications). Never deletes ACCEPTED or PENDING records.

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedReceived": 2,
    "deletedOwned": 1,
    "deletedNotifications": 0
  }
}
```

#### **PUT** `/api/notifications/:id/mark-read`
Mark a system `Notification` record (e.g. TRIP_DELETED, TRIP_COMMENT) as seen. Only the notification's owner can call this.

---

### Comments (Group Messages) Endpoints

All endpoints require authentication. Access is restricted to the trip owner and users with `ACCEPTED` participant status.

#### **GET** `/api/trips/:tripId/comments`
Returns all messages for a trip in chronological order.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tripId": "uuid",
      "message": "I booked the hotel for nights 3–5!",
      "createdAt": "2026-04-18T14:30:00.000Z",
      "author": {
        "id": 5,
        "name": "John",
        "surname": "Smith",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### **POST** `/api/trips/:tripId/comments`
Add a new message. Sends a `TRIP_COMMENT` Notification to all other ACCEPTED participants and the trip owner (excluding the sender). Message is limited to 1000 characters.

**Request Body:**
```json
{ "message": "I booked the hotel for nights 3–5!" }
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tripId": "uuid",
    "message": "I booked the hotel for nights 3–5!",
    "createdAt": "2026-04-18T14:30:00.000Z",
    "author": { "id": 5, "name": "John", "surname": "Smith", "email": "john@example.com" }
  }
}
```

#### **DELETE** `/api/trips/:tripId/comments/:commentId`
Delete a comment. Only the **comment author** or the **trip owner** may delete. Returns `403` otherwise.

**Response:** `200 OK`
```json
{ "success": true, "message": "Comment deleted" }
```

---

### Documents Endpoints

All endpoints require authentication (JWT token in Authorization header).

#### **GET** `/api/documents/expiring-soon`
Returns whether any of the authenticated user's documents is expiring within its warning window. Used to drive the orange `!` badge in the UI. Must be listed **before** `GET /api/documents/:id` in the router so the literal path `expiring-soon` is not mistaken for an `:id` parameter.

**Warning thresholds:**
| Document type | Warning window |
|---|---|
| Passport, ID Card, Visa, Insurance, Vaccination Card, Driving License | 6 months |
| Other | 30 days |

**Response:**
```json
{
  "success": true,
  "data": { "hasExpiring": true }
}
```

#### **GET** `/api/documents`
Get all documents for the authenticated user, ordered by expiration date ascending.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "documentType": "Passport",
      "description": "Passport number AB123456",
      "expirationDate": "2030-05-01",
      "createdAt": "2026-01-10T09:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### **POST** `/api/documents`
Add a new document.

**Request Body:**
```json
{
  "documentType": "Passport",
  "description": "Passport number AB123456",
  "expirationDate": "2030-05-01"
}
```

**Response:** `201 Created` — returns the created `UserDocument` object.

#### **PUT** `/api/documents/:id`
Update an existing document. Only the document owner can call this. Accepts the same body as `POST`. Returns the updated `UserDocument`.

#### **DELETE** `/api/documents/:id`
Delete a document. Only the document owner can call this.

**Response:** `200 OK`
```json
{ "success": true, "message": "Document deleted successfully" }
```

### Admin Endpoints

All admin endpoints require authentication **and** `role === 'ADMIN'`.

#### **GET** `/api/admin/users`
Returns a list of all registered users.

#### **PUT** `/api/admin/users/:id/role`
Change a user's role (`USER` / `ADMIN`).

#### **PUT** `/api/admin/users/:id/password`
Force-reset a user's password.

#### **DELETE** `/api/admin/users/:id`
Permanently delete a user account with automatic ownership transfer.

Before deleting, the system finds all group trips owned by that user which have at least one `ACCEPTED` participant. For each such trip the **earliest accepted participant** becomes the new owner (their `TripParticipant` record is removed since they are now the owner). Solo trips and group trips without accepted participants are removed via Prisma CASCADE together with the user record.

**Path parameter:** `id` — integer user ID

**Constraints:**
- Admin cannot delete their own account via this endpoint (use the self-service route or a different admin account)
- If the deleted user was a participant (not owner) in other trips, their `TripParticipant`, `Expense`, and `TripComment` records in those trips are removed by CASCADE

**Response `200`:**
```json
{ "success": true, "message": "User deleted successfully" }
```

**Error responses:** `400` (invalid ID or self-delete attempt), `401`, `403` (not admin), `404` (user not found), `500`.

#### **GET** `/api/admin/users/:id/permissions`
Returns the current permission set for a user.

**Response `200`:**
```json
{
  "success": true,
  "userId": 7,
  "permissions": ["SMART_PACKING"]
}
```

#### **PUT** `/api/admin/users/:id/permissions`
**Replace** the full permission set for a user (atomic: deletes existing, inserts new). Valid permission values: `"SMART_PACKING"`.

**Request Body:**
```json
{ "permissions": ["SMART_PACKING"] }
```

Pass an empty array `[]` to revoke all permissions.

**Response `200`:**
```json
{
  "success": true,
  "userId": 7,
  "permissions": ["SMART_PACKING"]
}
```

**Error responses:** `400` (invalid user ID, non-array body, or unknown permission name), `401`, `403` (not admin), `404` (user not found).

---

### Profile Endpoints

All endpoints require authentication.

#### **GET** `/api/profile`
Returns the current user's profile data.

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": 7,
    "email": "user@example.com",
    "name": "John",
    "surname": "Doe",
    "role": "USER",
    "birthday": "1995-06-15",
    "nationality": "Polish",
    "createdAt": "2026-01-10T09:00:00.000Z"
  }
}
```

#### **PUT** `/api/profile`
Update profile fields. Currently supports `birthday` (ISO date string or `null`) and `nationality` (string or `null`).

**Request Body:**
```json
{
  "birthday": "1995-06-15",
  "nationality": "Polish"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Profile updated successfully" }
```

#### **PUT** `/api/profile/password`
Change the current user's own password.

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

---

### AI Endpoints

All endpoints require authentication **and** the `SMART_PACKING` permission. Returns `403` if the permission is not granted.

#### **POST** `/api/ai/smart-packing`
Generate a personalised packing list, pre-trip todo list, estimated expenses, and a trip note using OpenAI GPT.

**Request Body:**
```json
{
  "title": "Greece Summer",
  "country": "Greece",
  "dateFrom": "2026-07-01",
  "dateTo": "2026-07-15",
  "tripType": ["Beach", "Leisure"],
  "budget": "€2500.00",
  "description": "Relaxing beach holiday with some sightseeing",
  "activities": ["Swimming", "Sightseeing"],
  "city": "Santorini",
  "accommodation": "Hotel",
  "transportToDestination": ["Plane"],
  "transportAround": ["Rental car"],
  "groupSize": 2,
  "specialNeeds": "vegetarian",
  "language": "en"
}
```

> `country`, `dateFrom`, `dateTo` are required. All other fields are optional but improve AI output quality. `language` accepts `"en"` (default) or `"pl"`.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "packingItems": [
      { "name": "Passport", "category": "Documents", "quantity": 1, "priority": "high" },
      { "name": "Sunscreen SPF50", "category": "Health & Medical", "quantity": 2, "priority": "high" }
    ],
    "todoItems": [
      { "title": "Check visa requirements", "description": "Polish citizens do not need a visa for Greece (Schengen area)", "priority": "high", "dueDate": "2026-06-01" }
    ],
    "expenses": [
      { "description": "Return flights Warsaw–Athens", "categoryName": "Transportation", "amount": 320, "currency": "EUR", "expenseDate": "2026-07-01" },
      { "description": "Hotel (14 nights)", "categoryName": "Accommodation", "amount": 1400, "currency": "EUR", "expenseDate": "2026-07-01" }
    ],
    "note": "Santorini in July has hot, dry weather (25–32 °C) with strong sunlight — pack light breathable clothing and high-SPF sunscreen. Polish passport holders do not need a visa for Greece. As a vegetarian, note that traditional Greek cuisine is generally vegetarian-friendly. Must-see: Oia sunset, Akrotiri archaeological site, Amoudi Bay. No special vaccinations are required for Greece."
  }
}
```

**Allowed packing categories:** `Clothing`, `Toiletries`, `Electronics`, `Documents`, `Health & Medical`, `Outdoor Gear`, `Food & Snacks`, `Entertainment`, `Other`

**Allowed expense categories:** `Accommodation`, `Food & Dining`, `Transportation`, `Activities & Entertainment`, `Shopping`, `Health & Medical`, `Communication`, `Other`

**Error responses:**
- `400` — missing required fields (`country`, `dateFrom`, `dateTo`)
- `401` — not authenticated
- `403` — user does not have `SMART_PACKING` permission
- `429` — OpenAI rate limit exceeded
- `500` — AI service error or invalid AI response

---

## 🔧 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://docker:docker@localhost:5433/trip_planner` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `JWT_SECRET` | Secret key for JWT signing | **Change in production!** |
| `JWT_EXPIRES_IN` | JWT token expiration time | `15m` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:5173,http://localhost:5174` |
| `OPENAI_API_KEY` | OpenAI API key — required for AI Smart Packing | — |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |

### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
```bash
# Check if Docker containers are running
docker ps

# Restart Docker containers
docker-compose down
docker-compose up -d

# Check container logs
docker-compose logs db
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Prisma Client Out of Sync

**Problem:** `Prisma Client is not up to date`

**Solution:**
```bash
cd server
npm run prisma:generate
```

### Frontend Build Errors

**Problem:** Module resolution errors

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Development Guidelines

### Code Style
- Follow TypeScript strict mode
- Use functional components with hooks in React
- Implement proper error handling for all async operations
- Write descriptive commit messages

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name
```

### Testing
```bash
# Backend tests (if available)
cd server
npm test

# Frontend tests (if available)
cd client
npm test
```


## 🙏 Acknowledgments

- React and Redux communities for excellent documentation
- Prisma team for the amazing ORM
- All open-source contributors whose libraries made this project possible

---

## 🔐 Basic admin account

```
Email: admin@admin.com
Password: admin
```

**Built with ❤️ using TypeScript, React, and Node.js**
