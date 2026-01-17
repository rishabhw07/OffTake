# See Your App Running - Quick Deploy Guide

You want to see your app live on the internet (not just localhost). Here's the fastest way:

## Option 1: Deploy to Vercel (Recommended - FREE, takes 10 minutes)

### Step 1: Push to GitHub (if not already there)

Open Terminal:

```bash
cd /Users/rishabhwuppalapati/OffTake

# Check if git is initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit"
```

Then go to GitHub.com, create a new repository, and follow their instructions to push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/offtake.git
git branch -M main
git push -u origin main
```

### Step 2: Get a Free Database (Supabase - 2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Click "New Project"
4. Fill in:
   - Name: `offtake`
   - Database Password: (choose one, save it!)
   - Region: Choose closest to you
5. Wait 2 minutes for setup
6. Go to **Settings** → **Database**
7. Find **"Connection string"** → **"URI"** tab
8. Copy the connection string that looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   Or use **"Connection pooling"** tab → Copy that URL

### Step 3: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. After login, click **"Add New Project"**
4. Import your GitHub repository (the `offtake` one you just pushed)
5. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Leave everything else as default

6. **Add Environment Variables:**
   Click "Environment Variables" and add these 3:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: (paste your Supabase connection string from Step 2)

   **Variable 2:**
   - Name: `NEXTAUTH_URL`
   - Value: `https://offtake-xyz.vercel.app` (you'll update this after first deploy)

   **Variable 3:**
   - Name: `NEXTAUTH_SECRET`
   - Value: (generate by running this in terminal):
     ```bash
     openssl rand -base64 32
     ```
     Copy the output and paste it

7. Click **"Deploy"**
8. Wait 2-3 minutes

### Step 4: Update NEXTAUTH_URL

1. After deploy completes, Vercel will show your URL like `https://offtake-abc123.vercel.app`
2. Copy that exact URL
3. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
4. Edit `NEXTAUTH_URL` → Update it to your actual URL
5. Click **"Redeploy"** or it auto-redeploys

### Step 5: Initialize Database

After first deployment, you need to set up the database:

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project (run in your project folder)
cd /Users/rishabhwuppalapati/OffTake
vercel link

# Pull environment variables
vercel env pull .env.local

# Set up database
npx prisma db push
```

**Option B: Direct connection**

```bash
# In Terminal, set your database URL (replace with actual Supabase URL)
export DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Push schema
cd /Users/rishabhwuppalapati/OffTake
npx prisma db push
```

## ✅ Done! Your App is Live

Visit your URL: `https://your-app-name.vercel.app`

You can now:
- Access it from anywhere (phone, laptop, etc.)
- Share the URL with others
- It's secure with HTTPS automatically

## Option 2: Deploy to Railway (Alternative)

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your `offtake` repo
5. Add PostgreSQL: "New" → "Database" → "Add PostgreSQL"
6. Add environment variables (same as Vercel)
7. Railway auto-deploys and gives you a URL

## Troubleshooting

**Build fails?**
- Check environment variables are all set
- Make sure DATABASE_URL is correct
- Check Vercel build logs

**Database connection error?**
- Verify your Supabase database is active (not paused)
- Make sure you copied the full connection string
- Try using the "Connection pooling" URL

**"Page not found" or errors?**
- Wait a minute after first deploy
- Check Vercel logs in dashboard
- Make sure database was initialized (`npx prisma db push`)

## Need Help?

Check the build logs in Vercel dashboard - they show exactly what's wrong.
