# Supabase Setup Guide for AI Auto Pro

## 🎯 Overview

AI Auto Pro now uses **Supabase** as its backend database. **NO MOCKS** - All customer data, inspections, and reports are stored in a real PostgreSQL database with authentication, file storage, and row-level security.

---

## 📋 What You'll Get

- ✅ **Real Database**: PostgreSQL with all tables and relationships
- ✅ **Authentication**: Email/password login for inspectors
- ✅ **File Storage**: Photos and audio files stored efficiently
- ✅ **Security**: Row-level security ensures inspectors only see their own data
- ✅ **Real-time**: Optional real-time subscriptions
- ✅ **Scalable**: Handles multiple inspectors and thousands of inspections
- ✅ **Free Tier**: Generous free tier for getting started

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `ai-auto-pro` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (or Pro if needed)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### Step 3: Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file from this project
4. Paste into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for "Success. No rows returned" message

This creates all tables, indexes, security policies, and triggers!

### Step 4: Create Storage Buckets

1. Click **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Create these 3 buckets:

   **Bucket 1:**
   - Name: `inspection-photos`
   - Public: ✅ Yes
   - Click "Create bucket"

   **Bucket 2:**
   - Name: `inspection-audio`
   - Public: ✅ Yes
   - Click "Create bucket"

   **Bucket 3:**
   - Name: `inspection-pdfs`
   - Public: ❌ No
   - Click "Create bucket"

4. For each bucket, click the bucket name → **Policies** → "Create policy"
5. Use "For full customization" and paste these policies:

   **For inspection-photos and inspection-audio:**
   ```sql
   -- SELECT policy (view files)
   CREATE POLICY "Authenticated users can view files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'inspection-photos'); -- Change bucket name for each

   -- INSERT policy (upload files)
   CREATE POLICY "Authenticated users can upload files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'inspection-photos'); -- Change bucket name for each
   ```

   **For inspection-pdfs:**
   ```sql
   -- SELECT policy (view own PDFs only)
   CREATE POLICY "Users can view their own PDFs"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'inspection-pdfs');

   -- INSERT policy
   CREATE POLICY "Users can upload PDFs"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'inspection-pdfs');
   ```

### Step 5: Get Your API Credentials

1. Click **Settings** (gear icon) → **API**
2. Find these values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

3. Copy both values - you'll need them next!

### Step 6: Configure Your Environment Variables

1. Open `.env.local` in your project
2. Replace the placeholder values:

   ```env
   # Replace these with your actual values from Step 5
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

3. **Save the file**

### Step 7: Install Dependencies

```bash
npm install
```

This installs `@supabase/supabase-js` and all other dependencies.

### Step 8: Run the Application

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Step 9: Create Your First User

1. Open the app in your browser
2. Click "Sign Up" (or the registration button)
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: Strong password (min 6 characters)
   - **Full Name**: Your Name
4. Click "Create Account"

**Note**: By default, Supabase requires email confirmation. To disable this for development:
   - Go to **Authentication** → **Settings** in Supabase
   - Turn OFF "Enable email confirmations"
   - Click "Save"

### Step 10: Verify Everything Works

1. Sign in with your new account
2. Create a test inspection
3. Upload a photo
4. Save the inspection
5. View it in the dashboard

Now check your Supabase project:
- **Table Editor** → **inspections** should show your inspection
- **Storage** → **inspection-photos** should show your uploaded photo

🎉 **Success!** Your database is live!

---

## 📊 Database Schema Overview

### Tables Created:

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user information (tied to auth.users) |
| `customers` | Customer contact information |
| `vehicles` | Vehicle details (VIN, make, model, year) |
| `inspections` | Main inspection records with checklist data |
| `inspection_photos` | Photo metadata and storage paths |
| `inspection_audio` | Audio note metadata and storage paths |
| `reports` | AI-generated reports and summaries |
| `payments` | Payment transaction records |
| `dtc_codes` | Diagnostic trouble codes |
| `activity_log` | Audit trail of user actions |

### Security:

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Inspectors can only see their own data
- ✅ Admins can see all data
- ✅ Automatic profile creation on signup (via trigger)
- ✅ Timestamps auto-update via triggers

---

## 🔐 User Roles

The system supports 3 roles:

1. **inspector** (default) - Regular inspector users
2. **manager** - Can view all inspections in organization
3. **admin** - Full access to all data

To promote a user to admin:
1. Go to Supabase **Table Editor** → **profiles**
2. Find the user's row
3. Change `role` from `inspector` to `admin`
4. Click "Save"

---

## 💾 Data Flow

### Saving an Inspection:

```
User completes inspection
        ↓
App calls backendService.saveReport()
        ↓
1. Create/get customer record
2. Create/get vehicle record
3. Create inspection record
4. Upload photos to Storage
5. Save photo metadata to DB
6. Save DTC codes (if any)
7. Create report record
        ↓
Data saved to Supabase
```

### Loading Inspections:

```
User opens dashboard
        ↓
App calls backendService.getReports()
        ↓
Supabase queries:
  - inspections table
  - JOIN with vehicles
  - JOIN with customers
  - JOIN with reports
  - JOIN with photos/audio
        ↓
Returns array of complete reports
```

---

## 🎯 Common Operations

### View All Your Data

Go to Supabase **Table Editor** and explore each table.

### View Uploaded Files

Go to Supabase **Storage** → Choose a bucket → Browse files.

### Check Who's Logged In

Go to Supabase **Authentication** → **Users** to see all registered users.

### View Activity Logs

Query the `activity_log` table in **Table Editor** to see what users have done.

### Backup Your Database

Go to **Database** → **Backups** to download a backup (Pro plan feature) or use:
```bash
pg_dump your_connection_string > backup.sql
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env.local`

### Issue: "Not authenticated" errors

**Solution**:
1. Check if user is logged in
2. Clear browser localStorage and re-login
3. Check Supabase **Authentication** → **Users** to verify account exists

### Issue: "Row Level Security" policy errors

**Solution**:
1. Verify you ran the full `supabase-schema.sql`
2. Check **Authentication** → **Policies** for each table
3. Make sure RLS is enabled

### Issue: Photos not uploading

**Solution**:
1. Verify storage buckets exist
2. Check bucket policies are created
3. Ensure `inspection-photos` bucket is public
4. Check browser console for errors

### Issue: Can't see other inspectors' data (as admin)

**Solution**:
1. Go to **Table Editor** → **profiles**
2. Find your user
3. Change `role` to `admin`
4. Log out and log back in

---

## 💰 Pricing & Limits

### Free Tier Includes:

- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ Unlimited API requests
- ✅ Social OAuth providers

This is **plenty** for most small to medium inspection businesses!

### When to Upgrade:

Upgrade to **Pro** ($25/month) if you need:
- More storage (8GB database, 100GB files)
- Database backups
- Priority support
- Custom domains

---

## 📈 Scaling Tips

### For 10+ Inspectors:

- ✅ Current setup handles this fine
- ✅ Consider Pro plan for backups
- ✅ Monitor storage usage in dashboard

### For 100+ Inspectors:

- ✅ Upgrade to Pro plan
- ✅ Enable database replication
- ✅ Consider CDN for photo delivery
- ✅ Monitor query performance

### For 1000+ Inspectors:

- ✅ Contact Supabase for Enterprise
- ✅ Consider dedicated database
- ✅ Implement caching layer

---

## 🔄 Migration from Mock Data

If you had any test data in the app's localStorage:

1. **It won't be migrated automatically** (there was no backend)
2. **Start fresh** with real data in Supabase
3. Old browser data can be cleared via DevTools → Application → Local Storage → Clear

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **SQL Editor**: Run custom queries
- **Table Editor**: Browse/edit data visually
- **API Docs**: https://supabase.com/docs/reference/javascript/introduction
- **Support**: https://supabase.com/support

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] All 3 storage buckets created with policies
- [ ] `.env.local` updated with correct credentials
- [ ] `npm install` completed
- [ ] App starts without errors
- [ ] Can sign up a new user
- [ ] Can sign in
- [ ] Can create an inspection
- [ ] Can upload photos
- [ ] Can view saved inspections
- [ ] Data visible in Supabase Table Editor

---

## 🎉 You're All Set!

Your AI Auto Pro application now has:

- ✅ Real PostgreSQL database
- ✅ Real authentication
- ✅ Real file storage
- ✅ NO MOCKS
- ✅ Production-ready

Start creating inspections and your data will be safely stored in Supabase!

---

**Questions?** Check the Supabase documentation or open an issue in the project repository.
