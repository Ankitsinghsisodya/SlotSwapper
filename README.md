# SlotSwapper

A real-time calendar event management and slot-swapping application built with React, Node.js, and WebSocket for live notifications.

## � Project Overview

**SlotSwapper** is a collaborative calendar application that allows users to manage their schedules and swap time slots with other users in real-time. The application solves the common problem of scheduling conflicts by enabling users to propose and accept slot swaps, making schedule coordination effortless.

### Key Design Choices

1. **Real-time Communication**

   - Implemented WebSocket for instant notifications instead of polling
   - WebSocket runs on the same port as HTTP server for simplified deployment
   - Connection-based user tracking ensures notifications reach the right users

2. **Authentication Strategy**

   - Dual authentication: Traditional email/password + Google OAuth
   - JWT tokens
   - Email OTP verification adds an extra security layer for email signups
   - Rate limiting on auth endpoints prevents brute-force attacks

3. **Database Design**

   - Prisma ORM for type-safe database queries
   - Enum-based status tracking (`BUSY`, `SWAPPABLE`, `SWAP_PENDING`)
   - Separate `SwapRequest` table to track all swap transactions
   - Automatic cleanup via cron jobs to maintain database hygiene

4. **Frontend Architecture**

   - Component-based React with TypeScript for type safety
   - Toast notifications replace blocking alerts for better UX
   - Custom confirmation modals with state management
   - Double-submit prevention using synchronous ref locks
   - Protected routes with automatic redirect to login

5. **API Design**

   - RESTful endpoints with clear resource-based routing
   - Consistent response structure (`ApiResponse` utility)
   - Centralized error handling middleware
   - Rate limiting per endpoint based on sensitivity

6. **DevOps & Deployment**
   - Docker multi-stage builds for optimized image sizes
   - Docker Compose for local development with PostgreSQL
   - Separate frontend (Vercel) and backend (Render) hosting for scalability
   - Environment-based configuration for dev/staging/prod

## �🚀 Features

- **Event Management**: Create, update, and delete calendar events
- **Slot Swapping**: Request to swap time slots with other users
- **Real-time Notifications**: WebSocket-powered instant notifications for swap requests and responses
- **Google OAuth**: Secure authentication with Google Sign-In
- **OTP Verification**: Email-based OTP for account verification
- **Rate Limiting**: Protected endpoints to prevent abuse
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS
- **Toast Notifications**: User-friendly feedback for all actions
- **Dockerized**: Easy deployment with Docker and Docker Compose

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Features Deep Dive](#features-deep-dive)
- [Deployment](#deployment)
- [Assumptions & Challenges](#assumptions--challenges)
- [License](#license)

## 🛠 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **WebSocket** - Real-time communication

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database management
- **PostgreSQL** - Primary database
- **WebSocket (ws)** - Real-time notifications
- **JWT** - Authentication tokens
- **Nodemailer** - Email service for OTP
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting middleware

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Render** - Cloud deployment platform

## 📁 Project Structure

```
SlotSweeper/
├── backend/
│   ├── src/
│   │   ├── controller/         # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   └── swap.controller.ts
│   │   ├── routes/             # Express routes
│   │   │   ├── auth.route.ts
│   │   │   ├── event.route.ts
│   │   │   └── swap.route.ts
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── websocket/          # WebSocket server
│   │   │   └── websocket.ts
│   │   ├── jobs/               # Scheduled tasks
│   │   │   └── cronJobs.ts     # Automated cleanup jobs
│   │   ├── utilities/          # Helper functions
│   │   │   ├── ApiError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   ├── asynchandler.ts
│   │   │   ├── prisma.ts
│   │   │   └── sendOTP.ts
│   │   └── index.ts            # App entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database migrations
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── MyCalendar.tsx
│   │   │   ├── SwapMarketplace.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ui/             # UI components
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker/
│   ├── Dockerfile.backend      # Backend Docker image
│   └── Dockerfile.frontend     # Frontend Docker image
├── docker-compose.yml          # Multi-container setup
└── README.md
```

## 📦 Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** >= 14.x (or use Docker)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Gmail Account** (for SMTP/OTP emails)
- **Google Cloud Project** (for OAuth, optional but recommended)

## � Quick Start Guide

Follow these steps to get SlotSwapper running locally in under 10 minutes:

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/Ankitsinghsisodya/SlotSwapper.git
cd SlotSwapper

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Setup PostgreSQL Database

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL container
docker run --name slotsweeper-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=slotsweeper \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Option B: Local PostgreSQL**

```bash
# Create database (if using local PostgreSQL)
psql -U postgres
CREATE DATABASE slotsweeper;
\q
```

### Step 3: Configure Environment Variables

**Backend** - Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slotsweeper?schema=public"
PORT=8000
JWT_SECRET_KEY="your-super-secret-jwt-key-change-this"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SERVER_ROOT_URI="http://localhost:8000"
CLIENT_ROOT_URI="http://localhost:5173"
SMTP_EMAIL="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
```

**Frontend** - Create `frontend/.env`:

```env
VITE_SERVER_URI=http://localhost:8000
VITE_WS_URI=ws://localhost:8000
```

### Step 4: Setup Database Schema

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 5: Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server will start at http://localhost:8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# App will start at http://localhost:5173
```

## �🔧 Detailed Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ankitsinghsisodya/SlotSwapper.git
cd SlotSwapper
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/slotsweeper?schema=public"

# Server
PORT=8000

# JWT
JWT_SECRET_KEY="your-super-secret-jwt-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# URLs
SERVER_ROOT_URI="http://localhost:8000"
CLIENT_ROOT_URI="http://localhost:5173"

# SMTP (for OTP emails)
SMTP_EMAIL="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_SERVER_URI=http://localhost:8000
VITE_WS_URI=ws://localhost:8000
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/api/v1/auth/google/callback`
   - Your production URL callback
6. Copy Client ID and Client Secret to `.env`

### SMTP Setup (Gmail)

1. Enable 2-Step Verification on your Gmail account
2. Generate App Password at [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the generated password in `SMTP_PASSWORD`

## 🏃 Running Locally

### 1. Setup Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

```

### 2. Start Backend

```bash
cd backend
npm run dev
```

Backend will run at `http://localhost:8000`

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run at `http://localhost:5173`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

Services:

- **Frontend**: http://localhost:4173
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### Building Individual Services

#### Backend

```bash
docker build -f docker/Dockerfile.backend \
  --build-arg DATABASE_URL="postgresql://postgres:postgres@postgres:5432/slotsweeper" \
  -t slotsweeper-backend .

docker run -p 8000:8000 \
  --env-file backend/.env \
  slotsweeper-backend
```

#### Frontend

```bash
docker build -f docker/Dockerfile.frontend \
  --build-arg VITE_SERVER_URI="http://localhost:8000" \
  --build-arg VITE_WS_URI="ws://localhost:8000" \
  -t slotsweeper-frontend .

docker run -p 4173:4173 slotsweeper-frontend
```

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: Your deployed backend URL

### Authentication

Most endpoints require JWT authentication. Include the token in cookies (automatically handled by browser) or in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

### 🔐 Authentication Endpoints

#### 1. Sign Up

**POST** `/api/v1/auth/signup`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "email": "john@example.com"
  }
}
```

**Rate Limit:** 5 requests per hour per IP

---

#### 2. Verify OTP

**POST** `/api/v1/auth/verifyOTP`

Verify email with OTP code sent during signup.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "User verified successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Rate Limit:** 3 requests per 15 minutes per IP

---

#### 3. Login

**POST** `/api/v1/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "picture": null
    }
  }
}
```

**Rate Limit:** 5 requests per 10 minutes per IP

---

#### 4. Get Google OAuth URL

**GET** `/api/v1/auth/google/url`

Get Google OAuth authorization URL.

**Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

---

#### 5. Google Login

**POST** `/api/v1/auth/google/googleLogin`

Complete Google OAuth login.

**Request Body:**

```json
{
  "code": "google-oauth-code-from-callback"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@gmail.com",
      "picture": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

---

#### 6. Logout

**POST** `/api/v1/auth/logout`

Logout current user (clears JWT cookie).

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Logout successful"
}
```

---

### 📅 Event Endpoints

#### 1. Get My Events

**GET** `/api/v1/events/my-events`

Get all events for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Events fetched successfully",
  "data": {
    "events": [
      {
        "id": 1,
        "title": "Team Meeting",
        "startTime": "2025-11-07T10:00:00.000Z",
        "endTime": "2025-11-07T11:00:00.000Z",
        "status": "SWAPPABLE",
        "ownerId": 1,
        "createdAt": "2025-11-06T08:00:00.000Z"
      }
    ]
  }
}
```

---

#### 2. Create Event

**POST** `/api/v1/events/create-event`

Create a new calendar event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Project Review",
  "startTime": "2025-11-08T14:00:00.000Z",
  "endTime": "2025-11-08T15:30:00.000Z"
}
```

**Response (201):**

```json
{
  "statusCode": 201,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 5,
      "title": "Project Review",
      "startTime": "2025-11-08T14:00:00.000Z",
      "endTime": "2025-11-08T15:30:00.000Z",
      "status": "BUSY",
      "ownerId": 1
    }
  }
}
```

---

#### 3. Update Event

**PUT** `/api/v1/events/update-event/:id`

Update an existing event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Updated Meeting Title",
  "startTime": "2025-11-08T15:00:00.000Z",
  "endTime": "2025-11-08T16:00:00.000Z",
  "status": "SWAPPABLE"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Event updated successfully",
  "data": {
    "event": {
      /* updated event object */
    }
  }
}
```

---

#### 4. Delete Event

**DELETE** `/api/v1/events/delete-event/:id`

Delete an event.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Event deleted successfully"
}
```

---

### 🔄 Swap Endpoints

#### 1. Get Swappable Slots

**GET** `/api/v1/swap/swappable-slots`

Get all available swappable slots from other users.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "swappableSlots": [
      {
        "id": 3,
        "title": "Lunch Break",
        "startTime": "2025-11-07T12:00:00.000Z",
        "endTime": "2025-11-07T13:00:00.000Z",
        "status": "SWAPPABLE",
        "owner": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```

---

#### 2. Request Swap

**POST** `/api/v1/swap/swap-request`

Request to swap your slot with another user's slot.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "requesterSlotId": 1,
  "responderSlotId": 3
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Swap request sent successfully",
  "data": {
    "swapRequest": {
      "id": 10,
      "requesterId": 1,
      "responderId": 2,
      "requesterSlotId": 1,
      "responderSlotId": 3,
      "status": "PENDING"
    }
  }
}
```

**Rate Limit:** 20 requests per hour per user

---

#### 3. Get Incoming Swap Requests

**GET** `/api/v1/swap/swap-incoming-requests`

Get all swap requests sent to you.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "incomingRequests": [
      {
        "id": 10,
        "status": "PENDING",
        "createdAt": "2025-11-06T10:00:00.000Z",
        "requester": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "requesterSlot": {
          "id": 1,
          "title": "Team Meeting",
          "startTime": "2025-11-07T10:00:00.000Z",
          "endTime": "2025-11-07T11:00:00.000Z"
        },
        "responderSlot": {
          "id": 3,
          "title": "Lunch Break",
          "startTime": "2025-11-07T12:00:00.000Z",
          "endTime": "2025-11-07T13:00:00.000Z"
        }
      }
    ]
  }
}
```

---

#### 4. Get Outgoing Swap Requests

**GET** `/api/v1/swap/swap-outgoing-requests`

Get all swap requests you've sent.

**Headers:** `Authorization: Bearer <token>`

**Response:** Similar structure to incoming requests

---

#### 5. Respond to Swap Request

**POST** `/api/v1/swap/swap-response`

Accept or reject a swap request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "swapId": 10,
  "response": "ACCEPTED"
}
```

_Options: `"ACCEPTED"` or `"REJECTED"`_

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Swap request accepted successfully"
}
```

---

### 🔌 WebSocket Events

Connect to WebSocket at `ws://localhost:8000` (or your production WS URL).

**Client → Server:**

```json
{
  "type": "register",
  "userId": 1
}
```

**Server → Client Notifications:**

**Swap Request Received:**

```json
{
  "type": "swap_request",
  "data": {
    "requestId": 10,
    "requester": "John Doe",
    "message": "John Doe wants to swap slots with you"
  }
}
```

**Swap Accepted:**

```json
{
  "type": "swap_accepted",
  "data": {
    "message": "Jane Smith accepted your swap request"
  }
}
```

**Swap Rejected:**

```json
{
  "type": "swap_rejected",
  "data": {
    "message": "Jane Smith rejected your swap request"
  }
}
```

---

### 📋 API Summary Table

| Method | Endpoint                              | Description                   | Auth Required | Rate Limit |
| ------ | ------------------------------------- | ----------------------------- | ------------- | ---------- |
| POST   | `/api/v1/auth/signup`                 | Register new user             | ❌            | 5/hour     |
| POST   | `/api/v1/auth/verifyOTP`              | Verify OTP                    | ❌            | 3/15min    |
| POST   | `/api/v1/auth/login`                  | Login with credentials        | ❌            | 5/10min    |
| GET    | `/api/v1/auth/google/url`             | Get Google OAuth URL          | ❌            | 10/10min   |
| POST   | `/api/v1/auth/google/googleLogin`     | Login with Google             | ❌            | 10/10min   |
| POST   | `/api/v1/auth/logout`                 | Logout user                   | ✅            | -          |
| GET    | `/api/v1/events/my-events`            | Get user's events             | ✅            | -          |
| POST   | `/api/v1/events/create-event`         | Create new event              | ✅            | -          |
| PUT    | `/api/v1/events/update-event/:id`     | Update event                  | ✅            | -          |
| DELETE | `/api/v1/events/delete-event/:id`     | Delete event                  | ✅            | -          |
| GET    | `/api/v1/swap/swappable-slots`        | Get available swappable slots | ✅            | -          |
| POST   | `/api/v1/swap/swap-request`           | Request slot swap             | ✅            | 20/hour    |
| GET    | `/api/v1/swap/swap-incoming-requests` | Get incoming swap requests    | ✅            | -          |
| GET    | `/api/v1/swap/swap-outgoing-requests` | Get outgoing swap requests    | ✅            | -          |
| POST   | `/api/v1/swap/swap-response`          | Accept/Reject swap            | ✅            | -          |

### 📮 Testing with cURL

**Example: Create Event**

```bash
curl -X POST http://localhost:8000/api/v1/events/create-event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Team Standup",
    "startTime": "2025-11-07T09:00:00.000Z",
    "endTime": "2025-11-07T09:30:00.000Z"
  }'
```

**Example: Request Swap**

```bash
curl -X POST http://localhost:8000/api/v1/swap/swap-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requesterSlotId": 1,
    "responderSlotId": 3
  }'
```

## 🔐 Features Deep Dive

### Authentication

- **JWT-based authentication** with httpOnly cookies
- **Google OAuth 2.0** integration for social login
- **Email OTP verification** for account security
- **Password hashing** with bcrypt
- **Protected routes** with authentication middleware

### Rate Limiting

Implemented using `express-rate-limit` to prevent abuse:

- **Login/Signup**: 5 attempts per 10 minutes per IP
- **OTP Verification**: 3 attempts per 15 minutes per IP
- **Google OAuth**: 10 requests per 10 minutes per IP
- **Swap Requests**: 20 per hour per authenticated user

### WebSocket Notifications

Real-time notifications for:

- **New swap requests** - Notifies responder when someone requests their slot
- **Swap accepted** - Notifies requester when their swap is accepted
- **Swap rejected** - Notifies requester when their swap is declined

WebSocket runs on the same port as the HTTP server (8000) using Node.js `ws` library.

### Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String?
  googleId  String?  @unique
  picture   String?
  events    Event[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Event {
  id        Int      @id @default(autoincrement())
  title     String
  startTime DateTime
  endTime   DateTime
  status    EventStatus @default(BUSY)
  ownerId   Int
  owner     User     @relation(fields: [ownerId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum EventStatus {
  BUSY
  SWAPPABLE
  SWAP_PENDING
}

model SwapRequest {
  id              Int      @id @default(autoincrement())
  requesterId     Int
  responderId     Int
  requesterSlotId Int
  responderSlotId Int
  status          SwapStatus @default(PENDING)
  createdAt       DateTime @default(now())
}

enum SwapStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### Cron Jobs (Automated Cleanup)

The backend includes automated scheduled tasks to maintain database hygiene:

**Configuration**: `backend/src/jobs/cronJobs.ts`

- **Schedule**: Daily at midnight (00:00) Asia/Kolkata timezone
- **Tasks**:
  - **OTP Cleanup**: Automatically deletes OTP records older than 5 minutes
  - **Event Cleanup**: Removes past events with end times older than 5 minutes

**How it works**:

- Uses the `cron` npm package for scheduling
- Job starts automatically when the backend server launches (imported in `index.ts`)
- Runs in the background without blocking the main application
- Logs errors if cleanup operations fail

**Cron Expression**: `"0 0 * * *"` (daily at midnight)

> **Note**: If you need more frequent cleanup (e.g., every 5 minutes for OTPs), update the cron expression in `cronJobs.ts`:
>
> - Every minute: `"* * * * *"`
> - Every 5 minutes: `"*/5 * * * *"`
> - Every hour: `"0 * * * *"`

**Database Impact**:

- Keeps the `otp` table lean by removing expired verification codes
- Prevents accumulation of old event records
- Automatic - no manual intervention required

### CORS Configuration

Backend allows multiple origins for development and production:

- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)
- `http://localhost:3000`
- Production URLs

Configured with:

- Credentials support for cookies
- Preflight request handling
- Custom headers support

## 🚀 Deployment

### Deploy Backend to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm ci --include=dev && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/index.js`
   - **Root Directory**: `backend`
4. Add environment variables from `backend/.env`
5. Add PostgreSQL database
6. Deploy!

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_SERVER_URI`: Your backend URL (e.g., `https://your-backend.onrender.com`)
   - `VITE_WS_URI`: Your backend WebSocket URL (e.g., `wss://your-backend.onrender.com`)
5. Deploy!
6. Vercel will automatically deploy on every push to main branch

### Environment Variables for Production

Update URLs to production values:

```env
# Backend
SERVER_ROOT_URI="https://your-backend.onrender.com"
CLIENT_ROOT_URI="https://your-frontend.vercel.app"

# Frontend
VITE_SERVER_URI=https://your-backend.onrender.com
VITE_WS_URI=wss://your-backend.onrender.com
```

## 🎯 Assumptions & Challenges

### Assumptions Made

1. **User Behavior**

   - Users will mark their slots as "SWAPPABLE" when they're willing to swap
   - Users only swap entire time slots, not partial durations
   - Only two users are involved in each swap transaction
   - Users have stable internet for WebSocket connections

2. **Technical Assumptions**

   - PostgreSQL is available (local or Docker)
   - Gmail SMTP is used for OTP emails (app passwords enabled)
   - Modern browsers with WebSocket support
   - Users authenticate before accessing protected features
   - Timezone handling is left to client-side for display (stored as UTC in DB)

3. **Business Logic**

   - Events can only be in one of three states: BUSY, SWAPPABLE, or SWAP_PENDING
   - A swap request can only be PENDING, ACCEPTED, or REJECTED
   - When a swap is accepted, both events' owners are swapped automatically
   - Expired OTPs (>5 minutes) are cleaned up by cron job daily
   - Past events are cleaned up automatically

4. **Security Assumptions**
   - JWT tokens in httpOnly cookies provide sufficient session security
   - Rate limiting by IP is adequate for preventing abuse
   - CORS configuration allows legitimate origins only
   - Environment variables are properly secured in production

### Challenges Faced & Solutions

#### 1. **Real-time Notification Architecture**

**Challenge:** Designing a scalable WebSocket system that notifies the right users without polling.

**Solution:**

- Implemented connection-based user tracking with a `Map<userId, WebSocket>`
- Register users on WebSocket connection with their JWT-verified userId
- Target specific users for swap notifications
- Gracefully handle disconnections and reconnections

#### 2. **Double-Submit Prevention**

**Challenge:** Users could click "Create Event" multiple times rapidly, causing duplicate events.

**Solution:**

- Added synchronous ref lock (`useRef`) in React to catch rapid clicks
- Combined with state-based UI disable (`isCreating`) for visual feedback
- Disabled submit button while request is in flight
- Added loading spinner for better UX

#### 3. **Authentication Flow Complexity**

**Challenge:** Supporting both email/password and Google OAuth with OTP verification.

**Solution:**

- Created separate auth flows: email → OTP verification vs. Google → instant login
- Unified user model to handle both `password` and `googleId` (both optional)
- JWT middleware validates tokens regardless of auth method
- Rate limiting applied per auth method to prevent abuse

#### 4. **CORS and Cookie Issues**

**Challenge:** Credentials (cookies) not being sent cross-origin during local development.

**Solution:**

- Configured CORS to reflect requesting origin with `origin: true`
- Enabled `credentials: true` for cookie support
- Added preflight (OPTIONS) request handling
- Documented proper CORS setup for production deployment

#### 5. **Database Migration in Docker**

**Challenge:** Prisma migrations failing in Docker builds due to missing DATABASE_URL.

**Solution:**

- Pass `DATABASE_URL` as build arg to Docker for `prisma generate`
- Run `prisma migrate deploy` in container startup script, not during build
- Install dev dependencies during build to ensure `tsc` and Prisma CLI available
- Created multi-stage approach for cleaner builds

#### 6. **Timezone Handling**

**Challenge:** Events stored in UTC but users expect local time display.

**Solution:**

- Store all timestamps in UTC in PostgreSQL
- Let frontend handle timezone conversion using JavaScript `Date` methods
- Use `datetime-local` input in forms for natural time entry
- Format displays with `toLocaleString()` for user's local timezone

#### 7. **Cron Job Timing**

**Challenge:** Initial cron schedule (daily) didn't match business logic (5-minute OTP expiry).

**Solution:**

- Documented cron expression and provided examples for different frequencies
- Made it easy to customize: change one string in `cronJobs.ts`
- Explained that daily cleanup is sufficient for old events, but OTPs could use more frequent runs
- Job auto-starts on server launch (imports in `index.ts`)

#### 8. **Swap Logic Atomicity**

**Challenge:** Ensuring swap operations don't leave inconsistent state if one update fails.

**Solution:**

- Used Prisma transactions for atomic swap operations
- Update swap request status and both events' owners in single transaction
- Rollback entire operation if any step fails
- Added proper error handling and user-facing error messages

#### 9. **Rate Limiting Strategy**

**Challenge:** Balancing security (prevent abuse) with UX (don't block legitimate users).

**Solution:**

- Tiered rate limits: strict on auth (5/10min), moderate on swaps (20/hour)
- Per-IP limits for public endpoints, per-user for authenticated actions
- Clear error messages when limit exceeded
- Recommended Redis-backed store for production scalability

#### 10. **Toast Notification System**

**Challenge:** Replacing blocking `alert()` and `confirm()` without losing important user feedback.

**Solution:**

- Integrated toast component library for non-blocking notifications
- Created custom confirmation modal for destructive actions (delete)
- Consistent success/error feedback across all user actions
- WebSocket notifications trigger toasts for real-time events

### Lessons Learned

1. **WebSocket State Management**: Keep connection state simple; avoid over-engineering reconnection logic initially
2. **Rate Limiting**: Start strict, then relax based on real usage patterns
3. **Docker Development**: Always test Docker builds early; environment variables and build context can be tricky
4. **Type Safety**: TypeScript catches many bugs early; invest time in proper typing
5. **User Feedback**: Non-blocking UI feedback (toasts) greatly improves perceived responsiveness

### Future Improvements

- [ ] Add Redis for distributed WebSocket connections (horizontal scaling)
- [ ] Implement slot conflict detection (prevent double-booking)
- [ ] Add recurring events support
- [ ] Implement swap history/audit log
- [ ] Add email notifications for swap requests (not just real-time)
- [ ] Create mobile app (React Native)
- [ ] Add user profiles and preferences
- [ ] Implement slot search/filter functionality
- [ ] Add calendar export (iCal format)
- [ ] Implement multi-party swaps (3+ users)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ankit Singh Sisodya** - [@Ankitsinghsisodya](https://github.com/Ankitsinghsisodya)

## 🙏 Acknowledgments

- React and Vite teams for amazing tools
- Prisma for the excellent ORM
- Tailwind CSS for beautiful styling
- Node.js and Express communities

## 📞 Support

For support, email ankitsingh24012005@gmail.com or open an issue on GitHub.

---

**Happy Swapping! 🔄**
