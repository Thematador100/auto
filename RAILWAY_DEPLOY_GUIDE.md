# 🚂 Deploy to Railway in 3 Minutes

Simple step-by-step guide to deploy your AI Auto Pro backend to Railway via GitHub.

---

## 📋 What You Need

- ✅ GitHub account (you have this)
- ✅ Railway account (you just created this)
- ✅ Your Neon database URL (you have this)
- ✅ Your API keys (you have these)

---

## 🚀 Step-by-Step Deployment

### Step 1: Go to Railway Dashboard

1. Open https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**

### Step 2: Connect GitHub Repository

1. Click **"Configure GitHub App"** (if first time)
2. Select **"Thematador100/auto"** repository
3. Give Railway access to the repository
4. Back in Railway, select the **"auto"** repository
5. Select branch: **"claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ"**

### Step 3: Configure Root Directory

Railway will detect your repository. You need to tell it to use the `server` directory:

1. After selecting the repo, Railway shows deployment settings
2. Look for **"Root Directory"** or **"Build Settings"**
3. Set **Root Directory** to: `server`
4. Railway will automatically detect it's a Node.js app

### Step 4: Add Environment Variables

Click on **"Variables"** tab and add these:

```
DATABASE_URL=postgresql://neondb_owner:npg_tj5sx3lfCXWT@ep-late-dew-a4ypqira-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=ai-auto-pro-secret-key-2024-production

GEMINI_API_KEY=AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU

DEEPSEEK_API_KEY=sk-c7cb7706be1d4185ad81ef4e4df7ecf7

PREFERRED_AI_PROVIDER=deepseek

NODE_ENV=production

PORT=3001
```

**Important:** Copy and paste each variable exactly as shown above.

### Step 5: Deploy!

1. Click **"Deploy"** button
2. Railway will:
   - ✅ Clone your repository
   - ✅ Install dependencies (`npm install`)
   - ✅ Build TypeScript (`npm run build`)
   - ✅ Start the server (`npm start`)
   - ✅ Assign a public URL

This takes about 2-3 minutes.

### Step 6: Get Your Backend URL

1. Once deployed, go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Copy the URL (looks like: `https://your-app.up.railway.app`)

**Save this URL - you'll need it for your frontend!**

---

## ✅ Verify Deployment

Test your backend is working:

```bash
# Replace with your actual Railway URL
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-11T..."}
```

---

## 🔄 Automatic Deployments

**From now on, every time you push to GitHub:**
- Railway automatically detects the push
- Rebuilds and redeploys your backend
- **No manual steps needed!**

```bash
git add .
git commit -m "Update backend"
git push origin claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ

# Railway auto-deploys in ~2 minutes
```

---

## 🔧 Railway Dashboard Features

### View Logs
- Click on your service
- Go to **"Deployments"** tab
- Click on latest deployment
- View real-time logs

### Monitor Usage
- **"Metrics"** tab shows:
  - CPU usage
  - Memory usage
  - Network traffic
  - Request count

### Update Environment Variables
- **"Variables"** tab
- Add/edit/delete variables
- Service automatically restarts

### Custom Domain (Optional)
- **"Settings"** → **"Domains"**
- Add your custom domain
- Railway provides SSL automatically

---

## 💰 Pricing

**Starter Plan (Free):**
- $5 free credit per month
- Perfect for development and testing
- Enough for ~500 hours of runtime

**Developer Plan ($5/month):**
- $5 credit included
- Additional usage billed
- Great for production

Your backend uses minimal resources, so the free tier should be sufficient initially.

---

## 🐛 Troubleshooting

### Deployment Failed

**Check:**
1. Root directory is set to `server`
2. All environment variables are added
3. DATABASE_URL is correct
4. View logs in "Deployments" tab for errors

### Can't Access Backend

**Check:**
1. Domain is generated (Settings → Domains)
2. Service is running (green status)
3. Health endpoint: `https://your-url.up.railway.app/health`

### Database Connection Error

**Check:**
1. DATABASE_URL is correct (no extra spaces)
2. Neon database is not paused
3. Connection string includes `?sslmode=require`

---

## 📞 Next Steps

After deployment:

1. ✅ Save your Railway backend URL
2. ✅ Test the health endpoint
3. ✅ Update your Vercel frontend to use the Railway URL
4. ✅ Test the full application

See **CONNECT_FRONTEND.md** for instructions on connecting your Vercel frontend to Railway backend.

---

## 🎉 Success!

Once deployed, your backend will be:
- 🟢 Live at a public URL
- 🔄 Auto-deploying on every git push
- 📊 Monitored via Railway dashboard
- 🔐 Secure with environment variables
- 💰 Running on free tier

**No more manual deployments or credential entry!**
