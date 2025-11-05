# SlotSwapper

A real-time calendar event management and slot-swapping application built with React, Node.js, and WebSocket for live notifications.

## 🚀 Features

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

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Features Deep Dive](#features-deep-dive)
- [Deployment](#deployment)
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

## 🔧 Installation

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

### Authentication Endpoints

| Method | Endpoint                          | Description            | Rate Limit |
| ------ | --------------------------------- | ---------------------- | ---------- |
| POST   | `/api/v1/auth/signup`             | Register new user      | 5/hour     |
| POST   | `/api/v1/auth/login`              | Login with credentials | 5/10min    |
| POST   | `/api/v1/auth/verifyOTP`          | Verify OTP             | 3/15min    |
| GET    | `/api/v1/auth/google/url`         | Get Google OAuth URL   | 10/10min   |
| POST   | `/api/v1/auth/google/googleLogin` | Login with Google      | 10/10min   |
| POST   | `/api/v1/auth/logout`             | Logout user            | -          |

### Event Endpoints

| Method | Endpoint                          | Description       | Protected |
| ------ | --------------------------------- | ----------------- | --------- |
| GET    | `/api/v1/events/my-events`        | Get user's events | ✅        |
| POST   | `/api/v1/events/create-event`     | Create new event  | ✅        |
| PUT    | `/api/v1/events/update-event/:id` | Update event      | ✅        |
| DELETE | `/api/v1/events/delete-event/:id` | Delete event      | ✅        |

### Swap Endpoints

| Method | Endpoint                              | Description                   | Protected |
| ------ | ------------------------------------- | ----------------------------- | --------- |
| GET    | `/api/v1/swap/swappable-slots`        | Get available swappable slots | ✅        |
| POST   | `/api/v1/swap/swap-request`           | Request slot swap             | ✅        |
| GET    | `/api/v1/swap/swap-incoming-requests` | Get incoming swap requests    | ✅        |
| GET    | `/api/v1/swap/swap-outgoing-requests` | Get outgoing swap requests    | ✅        |
| POST   | `/api/v1/swap/swap-response`          | Accept/Reject swap            | ✅        |

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
