# Production Deployment Guide

This guide will help you deploy OffTake to a secure, production-ready environment accessible from anywhere.

## Recommended Platform: Vercel

Vercel is the recommended platform for Next.js applications as it provides:
- Automatic HTTPS/SSL encryption
- Global CDN distribution
- Built-in security features
- Easy environment variable management
- Free tier available

## Step 1: Set Up Production Database

### Option A: Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use the "Connection pooling" string for better performance)
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true`

### Option B: Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project → Add PostgreSQL
3. Copy the connection string from the database service

### Option C: Neon

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard

## Step 2: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/offtake.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build` (default)
     - Output Directory: `.next` (default)

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   DATABASE_URL=your-production-database-url
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-a-secure-random-string
   ```
   
   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts and add environment variables when asked.

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Initialize Production Database

After deployment, you need to run database migrations:

### Option A: Using Vercel CLI

```bash
# Set your production database URL
export DATABASE_URL="your-production-database-url"

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push --accept-data-loss
```

### Option B: Using Vercel Build Command

Add to your `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

Then update Vercel build command to: `npm run vercel-build`

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Step 5: Security Checklist

✅ **Completed automatically by Vercel:**
- HTTPS/SSL encryption
- Security headers (configured in `next.config.js`)
- DDoS protection
- Global CDN

✅ **Configured in code:**
- Secure cookies in production
- Rate limiting
- Authentication security
- SQL injection protection (via Prisma)
- XSS protection headers

## Alternative Deployment Options

### Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add environment variables
4. Railway automatically handles HTTPS

### Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node
5. Add environment variables
6. Render provides HTTPS automatically

### AWS / Google Cloud / Azure

For enterprise deployments, you can deploy to:
- AWS (using Amplify or ECS)
- Google Cloud Run
- Azure App Service

These require more configuration but offer more control.

## Environment Variables Reference

### Required Variables

```bash
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here
```

### Optional Variables

```bash
NODE_ENV=production
```

## Monitoring & Maintenance

### Database Migrations

When you update the Prisma schema:

1. Update `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name migration-name`
3. Apply to production: `npx prisma migrate deploy` (or `prisma db push`)

### Viewing Database

Use Prisma Studio:
```bash
npx prisma studio
```

Or connect directly to your production database using your database provider's dashboard.

## Troubleshooting

### Build Fails

- Check environment variables are set correctly
- Verify database connection string
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database firewall settings (allow Vercel IPs)
- Ensure database is accessible from internet

### Authentication Not Working

- Verify NEXTAUTH_URL matches your domain exactly
- Check NEXTAUTH_SECRET is set
- Ensure cookies are enabled in browser

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong NEXTAUTH_SECRET** - Generate with `openssl rand -base64 32`
3. **Enable 2FA on Vercel account**
4. **Regularly update dependencies**: `npm audit fix`
5. **Monitor Vercel logs** for suspicious activity
6. **Use database connection pooling** for better performance

## Support

For issues:
- Check Vercel deployment logs
- Review database connection
- Verify environment variables
- Check Next.js documentation
