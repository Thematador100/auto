# 🔗 Connect Your Vercel Frontend to Railway Backend

Simple guide to connect your AI Auto Pro frontend (on Vercel) to your backend (on Railway).

---

## 📋 Prerequisites

- ✅ Backend deployed to Railway (see RAILWAY_DEPLOY_GUIDE.md)
- ✅ Railway backend URL (e.g., `https://your-app.up.railway.app`)
- ✅ Frontend on Vercel

---

## 🚀 Step-by-Step Connection

### Step 1: Add Environment Variable to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your **AI Auto Pro** project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:

```
Name: VITE_API_URL
Value: https://your-app.up.railway.app
```

**Replace** `https://your-app.up.railway.app` with your actual Railway URL!

5. Select environments: **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 2: Update Frontend Code (If Needed)

Check if your frontend services use the environment variable. The files should already be configured, but verify:

**File: `services/backendService.ts`** (or similar)

Should have something like:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const backendService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  // ... other methods
};
```

### Step 3: Redeploy Frontend

After adding the environment variable:

**Option A: Via Git Push**
```bash
git add .
git commit -m "Connect to Railway backend" --allow-empty
git push origin main
```
Vercel auto-deploys on push.

**Option B: Via Vercel Dashboard**
1. Go to your project in Vercel
2. Click **"Deployments"** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**

### Step 4: Verify Connection

1. Open your Vercel app URL
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to login or use any feature
5. Check that API calls go to your Railway URL

You should see requests like:
```
https://your-app.up.railway.app/api/auth/login
https://your-app.up.railway.app/api/reports
```

---

## 🧪 Test the Full Stack

### Test 1: Health Check

Open in browser:
```
https://your-app.up.railway.app/health
```

Should show:
```json
{"status":"ok","timestamp":"..."}
```

### Test 2: Registration

In your frontend app:
1. Go to registration page
2. Create a test account
3. Check DevTools Network tab
4. Should see successful POST to Railway backend

### Test 3: Login

1. Login with test account
2. Verify you get a JWT token
3. Check that authenticated requests work

### Test 4: AI Features

1. Try OBD scanner
2. Generate a report
3. Verify AI calls work through backend

---

## 🔐 CORS Configuration

Your backend should already have CORS configured for Vercel. If you get CORS errors:

**Update `server/src/index.ts`:**

```typescript
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',  // Your Vercel URL
    'http://localhost:5173',                // Local development
    process.env.FRONTEND_URL                // Optional: add as env var
  ].filter(Boolean),
  credentials: true
}));
```

Then redeploy backend:
```bash
git add server/src/index.ts
git commit -m "Update CORS for Vercel"
git push
```

Railway auto-deploys in ~2 minutes.

---

## 📊 Architecture Overview

```
User Browser
    ↓
Vercel Frontend (React)
    ↓ (API calls via VITE_API_URL)
Railway Backend (Express)
    ↓
Neon Database (PostgreSQL)
    ↓
AI Providers (Gemini/DeepSeek)
```

**All API keys are hidden in Railway backend!**

---

## 🐛 Troubleshooting

### CORS Errors

**Symptom:** Browser console shows CORS policy error

**Fix:**
1. Add your Vercel URL to CORS origins in backend
2. Redeploy backend
3. Clear browser cache

### API Calls to Localhost

**Symptom:** Network tab shows calls to `localhost:3001`

**Fix:**
1. Verify `VITE_API_URL` is set in Vercel
2. Redeploy frontend
3. Hard refresh browser (Ctrl+Shift+R)

### 404 Not Found

**Symptom:** API calls return 404

**Fix:**
1. Verify Railway backend is running
2. Check Railway URL is correct
3. Test health endpoint directly

### Authentication Errors

**Symptom:** Login works but other requests fail

**Fix:**
1. Check JWT token is being stored
2. Verify Authorization header is sent
3. Check token expiration (7 days)

---

## 🔄 Development Workflow

### Local Development

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on localhost:5173
# Uses localhost:3001 for API
```

### Production

**Backend:**
- Push to GitHub
- Railway auto-deploys
- Live at Railway URL

**Frontend:**
- Push to GitHub
- Vercel auto-deploys
- Uses Railway URL via VITE_API_URL

---

## 📈 Monitoring

### Backend (Railway)
- Railway Dashboard → Metrics
- View CPU, Memory, Network
- Check logs for errors

### Frontend (Vercel)
- Vercel Dashboard → Analytics
- View page views, performance
- Check function logs

### Database (Neon)
- Neon Console → Monitoring
- View query performance
- Check connection count

---

## 🎉 Success Checklist

- [ ] Railway backend deployed and running
- [ ] Railway URL obtained
- [ ] VITE_API_URL added to Vercel
- [ ] Frontend redeployed
- [ ] Health endpoint works
- [ ] Registration works
- [ ] Login works
- [ ] AI features work
- [ ] No CORS errors
- [ ] API calls go to Railway (not localhost)

---

## 📞 Next Steps

After successful connection:

1. **Test thoroughly** - Try all features
2. **Set up monitoring** - Add Sentry for error tracking
3. **Custom domain** - Add to both Vercel and Railway
4. **Performance** - Monitor and optimize
5. **Scaling** - Upgrade plans as needed

---

## 💡 Pro Tips

### Environment Variables
- Use different Railway projects for staging/production
- Update Vercel env vars accordingly
- Test in preview deployments first

### Security
- Rotate JWT_SECRET regularly
- Monitor API usage in Railway
- Set up rate limiting

### Performance
- Enable caching where appropriate
- Use Railway's built-in CDN
- Optimize database queries

---

## 🎊 You're Done!

Your full-stack application is now:
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Neon
- ✅ Auto-deploying on git push
- ✅ Secure with environment variables
- ✅ Production-ready!

**Congratulations on your enterprise-grade deployment!** 🎉
