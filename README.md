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
- Responsive design for desktop and mobile devices

---

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure authentication with bcrypt password hashing
- **JWT Token Management** - Stateless authentication with 15-minute token expiration
- **Automatic Session Refresh** - Smart session timer with 30-second warning before expiration
- **Protected Routes** - Frontend and backend route protection with automatic redirect to login

### 🗺️ Trip Management
- **Create Multiple Trips** - Organize different trips with custom names, descriptions, and dates
- **Trip Types** - Categorize trips (Business, Leisure, Adventure, Beach, Mountain, City, Cultural, Safari, Cruise, Road Trip, Family, Backpacking, Luxury, Budget)
- **Trip Filtering** - Search and filter trips by type, date range, or destination
- **Trip Images** - Visual representation with predefined trip images
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
- **Group Badge** - Visual indicator on trip cards when other accepted participants are present

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

### 🎨 User Experience
- **Custom Notifications** - Non-intrusive error notifications with auto-close (5 seconds)
- **Confirmation Dialogs** - Custom confirmation popups for destructive actions
- **Session Warning Dialog** - User-friendly countdown dialog before logout
- **Responsive Design** - Mobile-first approach with SCSS styling
- **Loading States** - Smooth loading indicators for async operations
- **Error Handling** - Comprehensive error messages from backend API

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
│   │   │   └── comments.controller.ts  # Group trip messages
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
│   │   │   └── comments.routes.ts   # /api/trips/:tripId/comments/*
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── error.middleware.ts  # Error handling
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
│   │   │   └── comments.service.ts  # Group trip messages
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
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
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

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    }
  }
}
```

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

### Trips Endpoints

All trip endpoints require authentication (JWT token in Authorization header).

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

## 🔧 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://docker:docker@localhost:5433/trip_planner` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `JWT_SECRET` | Secret key for JWT signing | **Change in production!** |
| `JWT_EXPIRES_IN` | JWT token expiration time | `15m` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |

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
