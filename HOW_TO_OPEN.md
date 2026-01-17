# How to Open and Check the Application

## Quick Start - Local Testing (5 minutes)

### Step 1: Install Dependencies

Open Terminal in this folder and run:

```bash
cd /Users/rishabhwuppalapati/OffTake
npm install
```

This will install all required packages (takes 1-2 minutes).

### Step 2: Set Up Environment Variables

You need a database. Choose one option:

#### Option A: Use Free Cloud Database (Easiest - No local setup)

1. Go to https://supabase.com → Sign up (free)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" one)
5. Create `.env` file in this folder:

```bash
# Create .env file
touch .env
```

Then add this content (replace with your actual database URL):

```bash
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="temp-secret-change-in-production"
```

Generate a random secret:
```bash
openssl rand -base64 32
```

#### Option B: Use Local PostgreSQL (If you have it installed)

```bash
# Create .env file
touch .env
```

Add:
```bash
DATABASE_URL="postgresql://your-username:your-password@localhost:5432/offtake?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"
```

Then create the database:
```bash
createdb offtake
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### Step 4: Start the Application

```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

### Step 5: Open in Browser

Open your web browser and go to:

**http://localhost:3000**

## What You'll See

1. **Home Page** - Welcome page with Sign In/Sign Up buttons
2. **Sign Up** - Create account as Manufacturer or Supplier
3. **Dashboard** - After signing in, you'll see your dashboard
4. **Create Listings** - Post RFQs or Supply Listings
5. **View Matches** - See automatic matches

## Testing the App

1. **Create a Manufacturer account:**
   - Click "Sign Up"
   - Choose "Manufacturer"
   - Fill in details
   - Sign in

2. **Create an RFQ:**
   - Go to Dashboard → My RFQs → Create RFQ
   - Fill in material details
   - Submit

3. **Create a Supplier account (in another browser/incognito):**
   - Open incognito/private window
   - Go to http://localhost:3000
   - Sign up as "Supplier"
   - Create a Supply Listing

4. **Check Matches:**
   - Both users can see matches in Dashboard → Matches
   - Request contact when interested
   - Test the mutual opt-in flow

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### "Prisma Client is not generated"
```bash
npm run db:generate
```

### Database connection error
- Check your `.env` file has correct DATABASE_URL
- Verify database is running/accessible
- For Supabase: Make sure you copied the connection pooling URL

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### Can't find .env file
Make sure you're in the project folder:
```bash
cd /Users/rishabhwuppalapati/OffTake
ls -la | grep .env
```

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev

# Open database GUI (optional)
npm run db:studio
```

## Next Steps

Once you've tested locally:
- See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) to deploy to production
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
