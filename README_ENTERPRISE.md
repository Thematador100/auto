# AI Auto Pro - Enterprise Edition

Enterprise-grade automotive inspection platform with AI-powered diagnostics.

## 🚀 Quick Start

### Automated Setup

```bash
# Clone the repository
git clone https://github.com/Thematador100/auto.git
cd auto
git checkout claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ

# Set up environment variables
./scripts/setup-env.sh

# Install and run
cd server
npm install
npm run db:push
npm run dev
```

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📋 Features

- **Authentication**: JWT-based secure authentication
- **AI Integration**: DeepSeek and Gemini AI for diagnostics
- **OBD-II Scanner**: Real-time vehicle diagnostics
- **Report Generation**: Professional inspection reports
- **Vehicle Management**: Track multiple vehicles
- **Image Analysis**: AI-powered damage detection
- **Secure API**: All API keys hidden server-side

## 🏗️ Architecture

```
├── server/              # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── db/         # Database schema and connection
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth and error handling
│   │   └── index.ts    # Server entry point
│   ├── Dockerfile      # Container configuration
│   └── package.json
├── components/          # React components
├── services/           # Frontend services
├── .github/workflows/  # CI/CD automation
└── scripts/            # Deployment scripts
```

## 🔐 Environment Variables

**All environment variables are automatically managed by your deployment platform.**

No manual credential entry needed after initial setup!

Required variables (configured once in platform dashboard):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `PREFERRED_AI_PROVIDER` - Default AI provider (deepseek/gemini)

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Server README](server/README.md) - Backend API documentation
- [Setup Complete](SETUP_COMPLETE.md) - Initial setup verification

## 🛠️ Development

### Backend

```bash
cd server
npm install
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Run production build
npm run db:push      # Update database schema
```

### Frontend

```bash
npm install
npm run dev          # Start Vite dev server
npm run build        # Build for production
```

### Docker

```bash
# Local development
docker-compose up -d

# Production build
cd server
docker build -t ai-auto-pro-backend .
docker run -p 3001:3001 --env-file .env ai-auto-pro-backend
```

## 🚢 Deployment (Fully Automated)

### Railway (Recommended)

**One-time setup:**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables in dashboard
4. Deploy

**After setup:** Every push to GitHub automatically deploys!

### Render

**One-time setup:**
1. Connect GitHub to Render
2. Create Web Service
3. Add environment variables
4. Deploy

**After setup:** Automatic deployments on every push!

### CI/CD Pipeline

GitHub Actions automatically:
- ✅ Runs tests on every push
- ✅ Builds Docker images
- ✅ Deploys to production
- ✅ No manual intervention needed

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📊 API Endpoints

### Public
- `GET /health` - Health check
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Protected (Requires JWT)
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add vehicle
- `POST /api/ai/analyze-dtc` - Analyze diagnostic codes
- `POST /api/ai/generate-report` - Generate inspection report

## 🔒 Security

- JWT authentication with 7-day expiration
- Bcrypt password hashing (10 rounds)
- API keys stored server-side only
- Input validation with Zod schemas
- CORS protection
- SQL injection prevention via Drizzle ORM

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📈 Monitoring

The application includes:
- Health check endpoint at `/health`
- Request logging
- Error tracking
- AI usage logging in database

For production, consider adding:
- Sentry for error tracking
- New Relic for APM
- DataDog for full observability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Thematador100/auto/issues)
- **Database**: [Neon Console](https://console.neon.tech)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 License

Proprietary - All rights reserved

---

**Status**: ✅ Production Ready

**Backend**: 🟢 Running  
**Database**: 🟢 Connected  
**CI/CD**: 🟢 Automated  
**Deployment**: 🟢 One-Click
