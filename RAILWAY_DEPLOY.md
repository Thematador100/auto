# Railway Deployment Guide

## 🚨 Important: Choose Your Configuration

Railway has **Root Directory** setting that affects how deployment works. Choose ONE approach:

---

## ✅ Option 1: Deploy from Root (RECOMMENDED)

**Railway Settings:**
- Root Directory: **BLANK** (delete `/server` if set)

**How it works:**
- Railway runs from repo root
- `nixpacks.toml` handles `cd server` automatically
- All config files work as-is

**Deploy Steps:**
1. Clear Root Directory in Railway Settings
2. Redeploy
3. Done! ✅

---

## ✅ Option 2: Deploy from /server Directory

**Railway Settings:**
- Root Directory: `/server`

**How it works:**
- Railway starts inside the server directory
- No `cd server` needed
- Railway auto-detects `package.json`

**Required Changes:**
1. Set Root Directory to `/server` in Railway
2. Railway will auto-install and build
3. Start command: `npm start` (no build needed if using auto-build)

---

## 🔧 Environment Variables (Both Options)

Add these in Railway → Variables:

```env
DATABASE_URL=postgresql://user:password@your-neon-db.neon.tech/dbname
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=<auto-set-by-railway>
```

---

## 🏥 Health Check

Both options expose: `/health`

Test after deploy:
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-11T..."
}
```

---

## 🐛 Troubleshooting

**Error: "directory /server does not exist"**
- ✅ Clear Root Directory (use Option 1)

**Error: "Missing packages from lock file"**
- ✅ Make sure Root Directory matches your chosen option

**Error: "tsc: not found"**
- ✅ Ensure `typescript` is in `devDependencies`
- ✅ Build command runs after install

**Build succeeds but app crashes:**
- ✅ Check environment variables are set
- ✅ Check DATABASE_URL is valid
- ✅ Check logs for missing dependencies

---

## 📊 Current Configuration

This repo is configured for **Option 1** (deploy from root).

If Railway Root Directory = `/server`, the build will fail.
If Railway Root Directory = blank, it will work! ✅
