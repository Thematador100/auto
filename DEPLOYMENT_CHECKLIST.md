# 🚀 AutoPro Inspector - Deployment Checklist

Use this checklist before launching to production to ensure everything is configured correctly.

## ⚙️ Pre-Deployment Setup

### 1. Supabase Configuration
- [ ] Created Supabase project
- [ ] Ran `supabase-migrations.sql` in SQL Editor
- [ ] Verified all tables created (users, reports, transactions)
- [ ] Enabled Email authentication provider
- [ ] (Optional) Configured Google OAuth provider
- [ ] (Optional) Configured GitHub OAuth provider
- [ ] Copied Project URL to `.env.local`
- [ ] Copied anon/public key to `.env.local`
- [ ] Tested Row Level Security policies
- [ ] Verified triggers are working (check user creation)

### 2. Google Gemini AI Configuration
- [ ] Created Google AI Studio account
- [ ] Generated API key
- [ ] Added API key to `.env.local` as `VITE_GEMINI_API_KEY`
- [ ] Tested API key with sample request
- [ ] Configured API quotas if needed

### 3. Stripe Configuration
- [ ] Created Stripe account
- [ ] Switched to Test Mode for development
- [ ] Created Pro Monthly subscription product ($49.99/month)
- [ ] Created Pro Yearly subscription product ($499.99/year)
- [ ] Created 6 per-report products:
  - [ ] Standard Car/SUV ($19.99)
  - [ ] Electric Vehicle ($24.99)
  - [ ] Commercial Truck ($39.99)
  - [ ] RV ($34.99)
  - [ ] Classic/Collector ($29.99)
  - [ ] Motorcycle ($14.99)
- [ ] Copied all Price IDs to `.env.local`
- [ ] Copied Publishable Key to `.env.local`
- [ ] Set up webhook endpoint (for production)
- [ ] Tested payment flow in test mode

### 4. Environment Variables
- [ ] Created `.env.local` from `.env.example`
- [ ] All required variables filled in:
  - [ ] `VITE_GEMINI_API_KEY`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
  - [ ] All Stripe Price IDs
- [ ] Set `VITE_ENABLE_MOCK_PAYMENTS=true` for development
- [ ] Set `VITE_ENABLE_OFFLINE_MODE=true` if needed

---

## 🧪 Testing Phase

### Authentication Testing
- [ ] Sign up with email/password works
- [ ] Email confirmation received (check spam folder)
- [ ] Sign in with existing account works
- [ ] OAuth sign in works (Google/GitHub if configured)
- [ ] User profile created in Supabase users table
- [ ] Free trial period set correctly (7 days)
- [ ] Sign out works

### Inspection Flow Testing
- [ ] VIN entry validates correctly
- [ ] NHTSA API returns vehicle data
- [ ] All 6 vehicle types selectable
- [ ] Checklist items load for each type
- [ ] Photo upload works
- [ ] Photo compression works
- [ ] Audio recording works
- [ ] Notes save correctly
- [ ] Report generation completes
- [ ] AI summary generates correctly

### Data Persistence Testing
- [ ] Report saves to Supabase
- [ ] Report appears in dashboard
- [ ] Report can be viewed after refresh
- [ ] Offline reports save to localStorage
- [ ] Reports sync when back online
- [ ] Delete report works

### Payment Testing (Test Mode)
- [ ] Subscription checkout opens
- [ ] Test card (4242 4242 4242 4242) works
- [ ] User plan updates to "pro" after payment
- [ ] Transaction recorded in transactions table
- [ ] Per-report purchase works
- [ ] Mock payment mode works (development)

### Export Features Testing
- [ ] PDF export generates correctly
- [ ] PDF includes all report sections
- [ ] JSON export downloads
- [ ] CSV export works for multiple reports

### External APIs Testing
- [ ] NHTSA VIN decoder works
- [ ] NHTSA recalls API returns data
- [ ] Vehicle history generates (mock data)
- [ ] Theft/salvage check works (mock data)
- [ ] Google Gemini AI responds
- [ ] Chat assistant with grounding works

---

## 🚀 Production Deployment

### Pre-Production
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No build warnings (critical ones)
- [ ] Tested build locally with `npm run preview`
- [ ] All features work in production build

### Stripe Production Setup
- [ ] Switch Stripe to Live Mode
- [ ] Update `.env` with live Stripe keys (pk_live_...)
- [ ] Recreate all products in Live Mode
- [ ] Update all Price IDs in `.env`
- [ ] Configure webhook with production URL
- [ ] Test webhook locally with Stripe CLI (optional)
- [ ] Set `VITE_ENABLE_MOCK_PAYMENTS=false`

### Supabase Production Setup
- [ ] Review RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting if needed
- [ ] Add custom domain (optional)
- [ ] Enable database logs monitoring

### Domain & Hosting
- [ ] Choose hosting platform (Vercel/Netlify/Custom)
- [ ] Register domain name
- [ ] Configure DNS records
- [ ] Set up SSL certificate (auto with Vercel/Netlify)
- [ ] Add environment variables to hosting platform
- [ ] Deploy to production
- [ ] Test production URL

### Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] Authentication works on production domain
- [ ] OAuth redirect URLs updated in providers
- [ ] Stripe webhook pointing to production URL
- [ ] Test full user flow end-to-end
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Verify analytics/monitoring (if configured)

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables (not hardcoded)
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS policies enabled and tested
- [ ] Stripe webhook signature verification (production)
- [ ] HTTPS enabled on production domain
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy configured (optional)
- [ ] Rate limiting configured (Supabase/Vercel)

---

## 📊 Monitoring & Analytics

### Optional but Recommended
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime)
- [ ] Configure performance monitoring
- [ ] Set up database query monitoring in Supabase
- [ ] Create alerts for payment failures
- [ ] Monitor API quota usage (Gemini, NHTSA)

---

## 📱 Marketing & Launch

- [ ] Prepare landing page copy
- [ ] Set up email service (for notifications)
- [ ] Configure email templates (welcome, trial ending, etc.)
- [ ] Create demo video or screenshots
- [ ] Prepare social media posts
- [ ] Set up customer support system
- [ ] Create FAQ page
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Refund policy defined

---

## 🐛 Common Issues & Solutions

### "Supabase credentials not configured"
**Solution**: Check that `.env.local` exists and has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Restart dev server after changes.

### "Authentication failed"
**Solution**: Verify Supabase Auth providers are enabled in dashboard. Check OAuth redirect URLs match exactly.

### "Payment not processing"
**Solution**: Verify Stripe publishable key is correct. Check browser console for detailed error. Ensure webhook is configured in production.

### "Report not saving"
**Solution**: Check Supabase RLS policies allow user to insert. Verify database migration ran successfully. Check browser console for errors.

### "Build fails"
**Solution**: Run `npm install` to ensure all dependencies installed. Check for TypeScript errors. Verify all imports are correct.

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Google Gemini Docs**: https://ai.google.dev/docs
- **Vite Docs**: https://vitejs.dev/guide/

---

## ✅ Final Launch Checklist

Before announcing launch:
- [ ] All critical features tested in production
- [ ] Payment processing verified end-to-end
- [ ] No broken links on website
- [ ] Mobile experience tested
- [ ] Legal pages accessible (ToS, Privacy Policy)
- [ ] Support email working
- [ ] Monitoring/alerts configured
- [ ] Database backups enabled
- [ ] Team has admin access to all platforms
- [ ] Rollback plan prepared

---

**🎉 Ready to Launch!**

Once all items are checked, you're ready to help car buyers avoid getting ripped off!

Good luck with your launch! 🚗✨
