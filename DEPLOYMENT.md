# 🚀 Enterprise Deployment Guide

Complete guide for deploying AI Auto Pro to production with automated environment management.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Platforms](#deployment-platforms)
3. [Environment Variables](#environment-variables)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Docker Deployment](#docker-deployment)
6. [Monitoring & Scaling](#monitoring--scaling)

---

## 🎯 Quick Start

### Prerequisites

- GitHub account with repository access
- Neon PostgreSQL database (already configured)
- API keys for Gemini and DeepSeek (already have)
- Deployment platform account (Railway, Render, or Vercel)

### One-Click Deploy Options

#### Option 1: Railway (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click "Deploy on Railway"
2. Connect your GitHub account
3. Select repository: `Thematador100/auto`
4. Select branch: `claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ`
5. Add environment variables (see below)
6. Deploy automatically starts

#### Option 2: Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click "Deploy to Render"
2. Connect GitHub repository
3. Render will read `render.yaml` automatically
4. Add environment variables in dashboard
5. Deploy automatically starts

#### Option 3: Vercel

```bash
npm install -g vercel
cd /path/to/auto
vercel --prod
```

Follow prompts and add environment variables in Vercel dashboard.

---

## 🌐 Deployment Platforms

### Railway (Best for Backend APIs)

**Pros:**
- Automatic HTTPS
- Built-in monitoring
- Easy environment variable management
- Automatic deployments on git push
- Generous free tier

**Setup:**
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Thematador100/auto`
4. Railway detects `railway.json` automatically
5. Add environment variables (see section below)
6. Click "Deploy"

**Environment Variables in Railway:**
```
DATABASE_URL=postgresql://neondb_owner:npg_tj5sx3lfCXWT@ep-late-dew-a4ypqira-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=ai-auto-pro-secret-key-2024-production
GEMINI_API_KEY=AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU
DEEPSEEK_API_KEY=sk-c7cb7706be1d4185ad81ef4e4df7ecf7
PREFERRED_AI_PROVIDER=deepseek
NODE_ENV=production
PORT=3001
```

### Render

**Pros:**
- Free SSL certificates
- Auto-deploy from GitHub
- Infrastructure as Code (render.yaml)
- Built-in health checks

**Setup:**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Render reads `render.yaml` automatically
5. Environment variables are pre-configured in `render.yaml`
6. Just fill in the secret values in dashboard

### Vercel (Best for Full-Stack)

**Pros:**
- Excellent for Next.js/React frontends
- Edge network (fast globally)
- Automatic HTTPS
- Preview deployments for PRs

**Setup:**
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel login`
3. Run: `vercel` (for preview) or `vercel --prod` (for production)
4. Add environment variables in Vercel dashboard

---

## 🔐 Environment Variables

### Required Variables

All deployment platforms need these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your Neon PostgreSQL connection string |
| `JWT_SECRET` | Random string | Secret key for JWT tokens (generate new for production) |
| `GEMINI_API_KEY` | Your key | Google Gemini API key |
| `DEEPSEEK_API_KEY` | Your key | DeepSeek API key |
| `PREFERRED_AI_PROVIDER` | `deepseek` | Which AI provider to use by default |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Server port (auto-set by some platforms) |

### Setting Environment Variables

#### Railway
```bash
# Via CLI
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"

# Or via Dashboard
# Go to project → Variables tab → Add variables
```

#### Render
```bash
# Via Dashboard only
# Go to service → Environment → Add Environment Variable
```

#### Vercel
```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# Or via Dashboard
# Go to project → Settings → Environment Variables
```

#### Docker/Docker Compose
```bash
# Create .env file in project root
cp server/.env.example .env
# Edit .env with your values
nano .env

# Then run
docker-compose up -d
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Automated)

The repository includes two GitHub Actions workflows:

#### 1. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` or `claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ` branches
- Changes in `server/` directory
- Manual trigger via GitHub Actions UI

**What it does:**
1. Runs tests
2. Builds TypeScript
3. Deploys to Railway (if configured)
4. Deploys to Render (if configured)

**Setup:**
Add these secrets in GitHub repository settings:
- `RAILWAY_TOKEN` - Get from Railway dashboard
- `RAILWAY_PROJECT_ID` - Get from Railway project settings
- `RENDER_API_KEY` - Get from Render account settings
- `RENDER_SERVICE_ID` - Get from Render service settings

#### 2. Docker Workflow (`.github/workflows/docker.yml`)

**Triggers:**
- Push to main branches
- Changes in `server/` or `Dockerfile`
- Manual trigger

**What it does:**
1. Builds Docker image
2. Pushes to GitHub Container Registry
3. Creates multi-platform images (amd64, arm64)

**No setup needed** - uses GitHub token automatically.

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:

```
RAILWAY_TOKEN=your_railway_token_here
RAILWAY_PROJECT_ID=your_project_id_here
RENDER_API_KEY=your_render_api_key_here
RENDER_SERVICE_ID=your_service_id_here
```

### Manual Deployment Trigger

```bash
# Trigger deployment manually
gh workflow run deploy.yml

# Or via GitHub UI
# Go to Actions → Deploy Backend → Run workflow
```

---

## 🐳 Docker Deployment

### Local Testing

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### Production Docker Deployment

#### Build Image
```bash
cd server
docker build -t ai-auto-pro-backend:latest .
```

#### Run Container
```bash
docker run -d \
  --name ai-auto-pro \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e GEMINI_API_KEY="your-key" \
  -e DEEPSEEK_API_KEY="your-key" \
  -e PREFERRED_AI_PROVIDER="deepseek" \
  -e NODE_ENV="production" \
  --restart unless-stopped \
  ai-auto-pro-backend:latest
```

#### Using GitHub Container Registry Image

```bash
# Pull pre-built image from GitHub
docker pull ghcr.io/thematador100/auto/backend:latest

# Run it
docker run -d \
  --name ai-auto-pro \
  -p 3001:3001 \
  --env-file .env \
  --restart unless-stopped \
  ghcr.io/thematador100/auto/backend:latest
```

### Docker on Cloud Platforms

#### AWS ECS
1. Push image to ECR
2. Create ECS task definition
3. Create ECS service
4. Add environment variables in task definition

#### Google Cloud Run
```bash
gcloud run deploy ai-auto-pro \
  --image ghcr.io/thematador100/auto/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="...",JWT_SECRET="..."
```

#### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name ai-auto-pro \
  --image ghcr.io/thematador100/auto/backend:latest \
  --dns-name-label ai-auto-pro \
  --ports 3001 \
  --environment-variables \
    DATABASE_URL="..." \
    JWT_SECRET="..."
```

---

## 📊 Monitoring & Scaling

### Health Checks

All platforms can monitor the health endpoint:
```
GET /health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T00:00:00.000Z"
}
```

### Railway Monitoring

- Built-in metrics dashboard
- CPU, Memory, Network usage
- Request logs
- Automatic alerts

### Render Monitoring

- Health check configuration in `render.yaml`
- Automatic restarts on failure
- Deployment logs
- Custom alerts via webhooks

### Application Monitoring (Recommended)

Add one of these services for production monitoring:

#### Sentry (Error Tracking)
```bash
npm install @sentry/node
```

#### New Relic (APM)
```bash
npm install newrelic
```

#### DataDog (Full Observability)
```bash
npm install dd-trace
```

### Scaling

#### Railway
- Auto-scaling based on CPU/Memory
- Configure in dashboard: Settings → Scaling

#### Render
- Manual scaling: Change instance type
- Horizontal scaling: Increase instance count

#### Docker/Kubernetes
```yaml
# kubernetes deployment
replicas: 3
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## 🔒 Security Checklist

### Before Production

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS (automatic on Railway/Render/Vercel)
- [ ] Configure CORS for your production domain
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Set up database backups (Neon has automatic backups)
- [ ] Add monitoring and alerting
- [ ] Review and rotate API keys regularly
- [ ] Set up logging (consider Logtail, Papertrail)
- [ ] Configure firewall rules if using VPS

### CORS Configuration

Update `server/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : ''
  ].filter(Boolean),
  credentials: true
}));
```

---

## 🆘 Troubleshooting

### Deployment Fails

**Check:**
1. All environment variables are set correctly
2. Database URL is accessible from deployment platform
3. Build logs for specific errors
4. Node.js version matches (22.x)

### Database Connection Issues

**Solutions:**
1. Verify Neon database is not paused
2. Check connection string format
3. Ensure SSL mode is correct
4. Test connection locally first

### API Not Responding

**Debug:**
```bash
# Check health endpoint
curl https://your-domain.com/health

# Check logs
railway logs  # Railway
render logs   # Render
vercel logs   # Vercel
```

---

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/Thematador100/auto/issues)
- **Documentation**: See `server/README.md`
- **Database**: [Neon Console](https://console.neon.tech)

---

## 🎉 Success!

Once deployed, your backend will be accessible at:
- Railway: `https://your-app.railway.app`
- Render: `https://ai-auto-pro-backend.onrender.com`
- Vercel: `https://your-app.vercel.app`

Test it:
```bash
curl https://your-domain.com/health
```

**Next Steps:**
1. Update frontend to use production API URL
2. Set up custom domain
3. Configure monitoring
4. Set up automated backups
5. Plan for scaling
