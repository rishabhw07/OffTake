# Quick Deploy Guide - Get Live in 10 Minutes

## Step 1: Set Up Database (5 minutes)

### Option A: Supabase (Easiest - Free)

1. Go to https://supabase.com → Sign up (free)
2. Click "New Project"
3. Fill in:
   - Name: `offtake`
   - Database Password: (save this!)
   - Region: Choose closest
4. Wait 2 minutes for setup
5. Go to Settings → Database
6. Copy the "Connection string" under "Connection pooling"
   - It looks like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### Option B: Railway (Also Free)

1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Provision PostgreSQL"
3. Click the PostgreSQL service → "Connect" tab
4. Copy the "Postgres Connection URL"

## Step 2: Push to GitHub (2 minutes)

```bash
cd /Users/rishabhwuppalapati/OffTake

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - OffTake platform"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/offtake.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (3 minutes)

1. **Go to https://vercel.com**
   - Sign up with GitHub (one click)

2. **Import Project**
   - Click "Add New Project"
   - Select your `offtake` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   Name: DATABASE_URL
   Value: [paste your database connection string from Step 1]
   ```

   ```
   Name: NEXTAUTH_URL
   Value: https://your-app-name.vercel.app
   (You'll update this after first deploy with your actual URL)
   ```

   ```
   Name: NEXTAUTH_SECRET
   Value: [generate with command below]
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste as the value.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

## Step 4: Update NEXTAUTH_URL (1 minute)

1. After first deploy, Vercel gives you a URL like `https://offtake-xyz.vercel.app`
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual URL
4. Redeploy (or it auto-redeploys)

## Step 5: Initialize Database (1 minute)

```bash
# Set your production database URL
export DATABASE_URL="your-database-url-from-step-1"

# Push schema to production database
npx prisma db push
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma db push
```

## ✅ Done!

Your app is now:
- ✅ Live on the internet (accessible from anywhere)
- ✅ Secured with HTTPS/SSL encryption
- ✅ Protected with security headers
- ✅ Using a production database
- ✅ Ready for users!

## Access Your App

Visit: `https://your-app-name.vercel.app`

## Next Steps

1. **Test the app:**
   - Sign up as a Manufacturer
   - Sign up as a Supplier (use different email)
   - Create listings
   - Test the matching system

2. **Custom Domain (Optional):**
   - Vercel Dashboard → Settings → Domains
   - Add your domain
   - Follow DNS instructions

3. **Monitor:**
   - Check Vercel dashboard for logs
   - Monitor database usage

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check build logs in Vercel

**Database connection error?**
- Verify DATABASE_URL is correct
- Check database is accessible (not paused)
- For Supabase: Use connection pooling URL

**Authentication not working?**
- Verify NEXTAUTH_URL matches your domain exactly
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

## Need Help?

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- See [SECURITY.md](./SECURITY.md) for security features
- Check Vercel documentation: https://vercel.com/docs
