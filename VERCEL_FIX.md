# Vercel Deployment Fix

## Issue Fixed

The build was trying to run `prisma db push` during build, which requires database access. This has been fixed - now only `prisma generate` runs during build.

## Steps to Deploy

### 1. Fix Security Vulnerabilities (Optional but Recommended)

In Terminal:
```bash
cd /Users/rishabhwuppalapati/OffTake

# Fix npm permissions first (if needed)
sudo chown -R $(whoami) ~/.npm

# Fix vulnerabilities
npm audit fix
```

### 2. Commit and Push the Fix

```bash
cd /Users/rishabhwuppalapati/OffTake

# Commit the package.json fix
git add package.json
git commit -m "Fix build script - remove db push from build"
git push
```

### 3. Set Up Database BEFORE Deploy

**Get Supabase Database:**

1. Go to https://supabase.com
2. Create/access your project
3. Settings → Database → Connection string → **Connection pooling** tab
4. Copy the URI (looks like):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### 4. Add Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

**Variable 1: DATABASE_URL**
- Key: `DATABASE_URL`
- Value: (paste Supabase connection string)

**Variable 2: NEXTAUTH_URL**
- Key: `NEXTAUTH_URL`
- Value: `https://your-app-name.vercel.app` (update after first deploy with actual URL)

**Variable 3: NEXTAUTH_SECRET**
- Key: `NEXTAUTH_SECRET`
- Value: Generate with:
  ```bash
  openssl rand -base64 32
  ```

### 5. Deploy to Vercel

1. In Vercel Dashboard, click **"Deployments"**
2. Click **"..."** on the latest deployment → **"Redeploy"**
3. Or push a new commit to trigger auto-deploy

### 6. Initialize Database (After First Successful Deploy)

Once Vercel build succeeds, initialize the database:

**Option A: Using Terminal**
```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Push schema
cd /Users/rishabhwuppalapati/OffTake
npx prisma db push
```

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
cd /Users/rishabhwuppalapati/OffTake
vercel link

# Pull environment variables
vercel env pull .env.local

# Push schema
npx prisma db push
```

### 7. Update NEXTAUTH_URL After Deploy

1. After deploy succeeds, Vercel shows your URL: `https://offtake-abc123.vercel.app`
2. Go to Vercel → Settings → Environment Variables
3. Edit `NEXTAUTH_URL` → Set to your actual URL
4. Redeploy

## Build Command

The build command is now:
```
prisma generate && next build
```

This:
- ✅ Generates Prisma client (doesn't need database)
- ✅ Builds Next.js app
- ❌ No longer runs `prisma db push` (which needs database)

## Troubleshooting

**Build still fails?**
- Check all 3 environment variables are set in Vercel
- Verify DATABASE_URL format is correct
- Check Vercel build logs for specific error

**"Prisma schema loaded" but hangs?**
- Make sure DATABASE_URL is set correctly
- The build should complete now (db push removed)

**Database connection error after deploy?**
- Run `npx prisma db push` separately (see Step 6)
- Verify Supabase project is active
- Check connection string is correct

## What Changed

**Before:**
```json
"build": "prisma generate && prisma db push && next build"
```

**After:**
```json
"build": "prisma generate && next build"
```

This fixes the deployment because:
- `prisma generate` doesn't need database access (just generates client code)
- `prisma db push` needs database access (runs separately after deploy)
- `next build` builds the application
