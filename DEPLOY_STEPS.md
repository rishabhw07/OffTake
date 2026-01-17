# Quick Steps to See Your App Live

Follow these steps in order. Your app will be live on the internet with a URL you can access from anywhere.

## Step 1: Get Free Database (2 minutes)

1. Go to: **https://supabase.com**
2. Click **"Start your project"** → Sign up (free, no credit card needed)
3. Click **"New Project"**
4. Fill in:
   - Name: `offtake`
   - Password: (create one, save it!)
   - Region: Choose closest
5. Wait 2 minutes
6. Go to **Settings** (left sidebar) → **Database**
7. Scroll to **"Connection string"**
8. Click **"Connection pooling"** tab
9. **Copy the URI** - it looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

**Save this URL - you'll need it in Step 3!**

## Step 2: Push Code to GitHub (3 minutes)

Open Terminal and run:

```bash
cd /Users/rishabhwuppalapati/OffTake

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - OffTake platform"
```

Then:

1. Go to **https://github.com** → Sign in
2. Click **"+"** → **"New repository"**
3. Name: `offtake`
4. Click **"Create repository"**
5. Copy the commands GitHub shows (looks like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/offtake.git
git branch -M main
git push -u origin main
```

Paste and run these in Terminal.

## Step 3: Deploy to Vercel (5 minutes)

1. Go to: **https://vercel.com**
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. After login, click **"Add New Project"**
4. Find your `offtake` repository → Click **"Import"**
5. **Configure Project:**
   - Framework: **Next.js** (auto-detected, leave default)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

6. **Click "Environment Variables"** and add 3 variables:

   **Variable 1: DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: (paste the Supabase URL from Step 1)

   **Variable 2: NEXTAUTH_URL**
   - Key: `NEXTAUTH_URL`
   - Value: `https://offtake-temp.vercel.app` (temporary, update after deploy)

   **Variable 3: NEXTAUTH_SECRET**
   - Key: `NEXTAUTH_SECRET`
   - Value: Generate by running this in Terminal:
     ```bash
     openssl rand -base64 32
     ```
     Copy the output and paste it here

7. Click **"Deploy"**
8. Wait 2-3 minutes ⏳

## Step 4: Update NEXTAUTH_URL (1 minute)

After deploy completes:

1. Vercel shows your URL like: `https://offtake-abc123.vercel.app`
2. **Copy that exact URL**
3. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
4. Find `NEXTAUTH_URL` → Click **"Edit"**
5. Change value to your actual URL: `https://offtake-abc123.vercel.app`
6. Click **"Save"**
7. Go to **"Deployments"** tab → Click **"..."** on latest deployment → **"Redeploy"**

## Step 5: Initialize Database (1 minute)

In Terminal:

```bash
cd /Users/rishabhwuppalapati/OffTake

# Set your database URL (replace with your actual Supabase URL from Step 1)
export DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Push database schema
npx prisma db push
```

You should see: `✅ Your database is now in sync with your Prisma schema`

## ✅ Done! Your App is Live

Visit your URL: **https://your-app-name.vercel.app**

You can now:
- ✅ Access from anywhere (phone, laptop, etc.)
- ✅ Share with others
- ✅ Secure HTTPS automatically enabled
- ✅ Works like any real web app

## Test Your App

1. **Visit your URL** (e.g., `https://offtake-abc123.vercel.app`)
2. Click **"Sign Up"**
3. Create account as **Manufacturer** or **Supplier**
4. Explore the dashboard
5. Create listings
6. Check matches

## Troubleshooting

**Build failed?**
- Check all 3 environment variables are set in Vercel
- Verify DATABASE_URL is correct (copy-paste from Supabase)
- Check Vercel build logs (click on failed deployment)

**Database connection error?**
- Make sure Supabase project is active (not paused)
- Verify you copied the full connection string
- Check database password is correct

**Authentication not working?**
- Make sure NEXTAUTH_URL matches your Vercel URL exactly
- Verify NEXTAUTH_SECRET is set
- Clear browser cookies and try again

**Need help?**
- Check Vercel deployment logs
- Check Supabase database logs
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for more details
