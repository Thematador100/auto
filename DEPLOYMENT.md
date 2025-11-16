# 🚀 Deployment & Hosting Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Domain Purchase & Setup](#domain-purchase--setup)
- [Hosting Options](#hosting-options)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

This guide will help you deploy your Auto Pro inspection app to production with a custom domain.

**What you'll need:**
- A domain name ($10-15/year)
- A hosting provider account (free tier available)
- Your Gemini API key
- 30-60 minutes

---

## Domain Purchase & Setup

### Recommended Domain Registrars

**1. Namecheap** (Recommended)
- **Price:** ~$10-12/year
- **Why:** Easy to use, great support, free privacy protection
- **Website:** https://www.namecheap.com

**2. Google Domains / Squarespace Domains**
- **Price:** ~$12-14/year
- **Why:** Clean interface, integrated with Google services
- **Website:** https://domains.google

**3. Cloudflare**
- **Price:** At-cost pricing (~$8-10/year)
- **Why:** Best if you're using Cloudflare for hosting/CDN
- **Website:** https://www.cloudflare.com/products/registrar/

### How to Purchase a Domain

1. **Choose Your Domain Name**
   - Keep it short and memorable
   - Example: `autoproinspect.com`, `quickautopro.com`
   - Check availability at any registrar above

2. **Purchase the Domain**
   - Select your domain name
   - Choose 1-year registration (can extend later)
   - Add domain privacy protection (usually free)
   - Complete purchase

3. **Access DNS Settings**
   - Log into your registrar account
   - Find "DNS Settings" or "Manage DNS"
   - You'll configure this after choosing your hosting

---

## Hosting Options

### Option 1: Vercel (Recommended for Beginners)

**Pros:**
- ✅ Free tier (perfect for starting out)
- ✅ Automatic SSL certificates
- ✅ Global CDN included
- ✅ Zero configuration needed
- ✅ Automatic deployments from GitHub
- ✅ Environment variables support

**Cons:**
- ⚠️ Free tier limits (100GB bandwidth/month - usually plenty)

**Cost:** Free tier, Pro starts at $20/month

**Best for:** Quick deployment, automatic updates

---

### Option 2: Netlify

**Pros:**
- ✅ Free tier available
- ✅ Easy drag-and-drop deployment
- ✅ Automatic SSL
- ✅ Built-in forms and serverless functions
- ✅ Great for static sites

**Cons:**
- ⚠️ Build minutes limited on free tier (300 min/month)

**Cost:** Free tier, Pro starts at $19/month

**Best for:** Simple deployment with form handling

---

### Option 3: Cloudflare Pages

**Pros:**
- ✅ Completely free (unlimited bandwidth!)
- ✅ Fastest global CDN
- ✅ Automatic SSL
- ✅ Great DDoS protection
- ✅ Integrated with Cloudflare DNS

**Cons:**
- ⚠️ Slightly more technical setup
- ⚠️ Build limits (500 builds/month on free tier)

**Cost:** Free tier (very generous)

**Best for:** High traffic sites, cost-conscious deployment

---

### Option 4: Traditional VPS (DigitalOcean, AWS, etc.)

**Pros:**
- ✅ Full control
- ✅ Can host multiple apps
- ✅ More customization

**Cons:**
- ⚠️ Requires more technical knowledge
- ⚠️ More setup and maintenance
- ⚠️ No automatic deployments

**Cost:** $5-10/month minimum

**Best for:** Advanced users who need full control

---

## Step-by-Step Deployment

### Deploy to Vercel (Recommended)

#### Step 1: Prepare Your Code

```bash
# Make sure your app builds successfully
npm install
npm run build

# Test the build
npm run preview
```

#### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Vercel

1. **Sign up for Vercel**
   - Go to https://vercel.com
   - Click "Sign Up"
   - Use "Continue with GitHub" (easiest)

2. **Import Your Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Vite app

3. **Configure Environment Variables**
   - Click "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your-api-key-here`
   - Click "Deploy"

4. **Wait for Deployment**
   - First deploy takes 1-2 minutes
   - You'll get a URL like `your-app.vercel.app`

#### Step 4: Connect Your Domain

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Enter your domain name (e.g., `autoproinspect.com`)
   - Vercel will show you DNS records to add

2. **In Your Domain Registrar**
   - Go to DNS settings
   - Add the records Vercel showed you:
     ```
     Type: A Record
     Name: @
     Value: 76.76.21.21

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

3. **Wait for DNS Propagation**
   - Can take 5 minutes to 48 hours
   - Usually works within 1-2 hours
   - Check status at https://dnschecker.org

#### Step 5: Enable SSL (Automatic!)

Vercel automatically provisions SSL certificates. Just wait a few minutes after DNS propagates.

---

### Deploy to Cloudflare Pages

#### Step 1: Build Your App

```bash
npm install
npm run build
```

#### Step 2: Create Cloudflare Account

1. Go to https://www.cloudflare.com
2. Sign up for free account
3. Go to "Workers & Pages" in sidebar

#### Step 3: Create Pages Project

1. Click "Create application" → "Pages"
2. Connect to your GitHub
3. Select your repository
4. Configure build settings:
   ```
   Build command: npm run build
   Build output directory: dist
   ```
5. Add environment variable:
   - `GEMINI_API_KEY` = `your-api-key-here`
6. Click "Save and Deploy"

#### Step 4: Connect Domain

1. In Cloudflare Pages, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain
4. If your domain is already on Cloudflare, it connects automatically
5. If not, follow instructions to point nameservers to Cloudflare

---

### Deploy to Netlify

#### Step 1: Build Your App

```bash
npm run build
```

#### Step 2: Deploy

**Option A: Drag & Drop (Fastest)**

1. Go to https://netlify.com
2. Sign up/login
3. Drag your `dist` folder to Netlify
4. Done!

**Option B: GitHub Integration**

1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Select repository
4. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. Add environment variable: `GEMINI_API_KEY`
6. Deploy

#### Step 3: Connect Domain

1. Go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain
4. Add these DNS records at your registrar:
   ```
   Type: A Record
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: YOUR-SITE.netlify.app
   ```

---

## SSL Certificate Setup

All modern hosting providers (Vercel, Netlify, Cloudflare) provide **automatic free SSL certificates** via Let's Encrypt.

**You don't need to do anything!** SSL will be provisioned automatically within minutes of DNS propagation.

### Verify SSL is Working

1. Visit `https://your-domain.com`
2. Look for padlock icon in browser
3. Click padlock → "Connection is secure"

### Force HTTPS Redirect

**Vercel**: Automatic
**Netlify**: Settings → Domain management → HTTPS → Force HTTPS redirect
**Cloudflare**: SSL/TLS → Edge Certificates → Always Use HTTPS

---

## Environment Variables

You'll need to set these in your hosting provider:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Where to add:**
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Build & deploy → Environment
- **Cloudflare Pages**: Settings → Environment variables

**Security tip:** Never commit `.env.local` to GitHub!

---

## Troubleshooting

### Issue: "Site not loading" after DNS setup

**Solution:**
- DNS propagation can take up to 48 hours
- Check status: https://dnschecker.org
- Clear your browser cache
- Try accessing in incognito mode

### Issue: "API Key not working"

**Solution:**
- Verify environment variable is set correctly
- Redeploy after adding environment variables
- Check API key is active in Google AI Studio

### Issue: "Build failed"

**Solution:**
```bash
# Test locally first
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "404 on refresh"

**Solution:**
- For Vercel: Add `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- For Netlify: Add `_redirects` file in `public/`:
  ```
  /*    /index.html   200
  ```

### Issue: "Slow loading times"

**Solution:**
- Enable CDN (automatic on Vercel/Cloudflare)
- Optimize images before upload
- Use lazy loading for images
- Consider upgrading plan for more bandwidth

### Issue: "Domain not connecting"

**Solution:**
- Verify DNS records are correct
- Remove any conflicting records (old A/CNAME records)
- Try using Cloudflare as DNS provider
- Contact your domain registrar support

---

## Post-Deployment Checklist

✅ Domain is accessible via HTTPS
✅ WWW and non-WWW both work
✅ SSL certificate shows as valid
✅ All pages load correctly
✅ API calls working (test inspection features)
✅ Mobile responsive
✅ Forms and file uploads working
✅ Set up monitoring (Vercel Analytics, Cloudflare Analytics)

---

## Cost Breakdown

### Minimal Setup (Perfect for Starting Out)
- Domain: ~$10-12/year
- Hosting: Free (Vercel/Cloudflare)
- SSL: Free (automatic)
- **Total: ~$10-12/year**

### Professional Setup
- Domain: ~$12/year
- Hosting: ~$20/month (Vercel Pro)
- Monitoring: Free (built-in analytics)
- **Total: ~$252/year**

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Domain Help**: Contact your registrar's support

---

## Need Help?

If you encounter issues during deployment, use the **Support Agent** in the app (click the help button in the bottom-right corner) for personalized assistance!

---

**Last Updated:** November 2025
