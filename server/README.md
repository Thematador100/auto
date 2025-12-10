# AI Auto Pro - Backend Server

Production-ready Node.js/Express backend with PostgreSQL (Neon) database.

## Features

- ✅ **Authentication**: JWT-based auth with bcrypt password hashing
- ✅ **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- ✅ **API Routes**:
  - `/api/auth` - User registration and login
  - `/api/reports` - CRUD operations for inspection reports
  - `/api/vehicles` - Vehicle management
  - `/api/ai` - Secure AI API proxy (hides API keys from frontend)
- ✅ **AI Integration**: Both DeepSeek and Gemini with usage tracking
- ✅ **TypeScript**: Fully typed with Zod validation
- ✅ **Security**: CORS, JWT auth, environment variables

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project (or use your existing "auto" project)
3. Copy your connection string
4. Update `DATABASE_URL` in `.env`

Your connection string looks like:
```
postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### 3. Run Database Migrations

```bash
npm run db:push
```

This will create all necessary tables in your Neon database.

### 4. Start the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Returns:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "pro"
  },
  "token": "jwt-token-here"
}
```

### Reports (Requires Auth)

All requests must include: `Authorization: Bearer <token>`

**POST /api/reports** - Create new report
**GET /api/reports** - Get all user reports
**GET /api/reports/:id** - Get single report
**DELETE /api/reports/:id** - Delete report

### Vehicles (Requires Auth)

**POST /api/vehicles** - Add new vehicle
**GET /api/vehicles** - Get all user vehicles
**GET /api/vehicles/:id** - Get single vehicle

### AI Proxy (Requires Auth)

**POST /api/ai/analyze-dtc** - Analyze diagnostic codes
**POST /api/ai/generate-report** - Generate inspection report

## Database Schema

- **users** - User accounts with auth
- **vehicles** - Vehicle information
- **reports** - Inspection reports with full data
- **ai_request_logs** - AI usage tracking for billing

## Environment Variables

See `.env.example` for all required environment variables.

**Critical:** Update `DATABASE_URL` with your actual Neon connection string!

## Security Notes

- API keys are stored server-side only (not exposed to browser)
- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (10 rounds)
- All routes validate input with Zod schemas
- CORS enabled for frontend origin

## Next Steps

After backend is running:
1. Update frontend to call backend API instead of localhost
2. Remove API keys from frontend .env.local
3. Update frontend services to use `/api/*` endpoints
