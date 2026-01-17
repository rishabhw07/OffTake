# Run on Your Local Machine - Quick Setup

Follow these steps to see your app running on your computer.

## Step 1: Get a Free Database (2 minutes) - No local setup needed!

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up (free, no credit card)
3. Click **"New Project"**
4. Fill in:
   - Name: `offtake`
   - Password: (create one, save it!)
   - Region: Choose closest
5. Wait 2 minutes
6. Go to **Settings** (left sidebar) → **Database**
7. Scroll to **"Connection string"**
8. Click **"Connection pooling"** tab
9. **Copy the URI** - looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Step 2: Set Up Environment File

Open Terminal:

```bash
cd /Users/rishabhwuppalapati/OffTake

# Create .env file (if it doesn't exist)
touch .env
```

Open `.env` file in a text editor and add:

```bash
DATABASE_URL="paste-your-supabase-url-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="temp-secret-for-local-testing-12345"
```

**Replace `paste-your-supabase-url-here` with the URL you copied from Step 1.**

## Step 3: Install Dependencies (if not done)

```bash
cd /Users/rishabhwuppalapati/OffTake
npm install
```

## Step 4: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

You should see: `✅ Your database is now in sync with your Prisma schema`

## Step 5: Start the App

```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

## Step 6: Open in Browser

Open your web browser and go to:

**http://localhost:3000**

## ✅ Done! Your App is Running

You should see:
- Welcome page with "Sign In" and "Sign Up" buttons
- Click "Sign Up" to create an account
- Choose "Manufacturer" or "Supplier"
- Fill in details and sign up
- You'll be redirected to the dashboard

## Test It Out

1. **Sign up as Manufacturer:**
   - Create an account
   - Go to "My RFQs" → "Create RFQ"
   - Fill in details and create an RFQ

2. **Sign up as Supplier (in another browser/incognito):**
   - Open incognito/private window
   - Go to http://localhost:3000
   - Sign up as "Supplier"
   - Create a Supply Listing

3. **Check Matches:**
   - Both can see matches in "Matches" tab
   - Request contact when interested

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Database connection error
- Check `.env` file has correct `DATABASE_URL`
- Verify you copied the full connection string from Supabase
- Make sure Supabase project is active (not paused)

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### Prisma Client not generated
```bash
npm run db:generate
```

### .env file not found
Make sure you're in the right folder:
```bash
cd /Users/rishabhwuppalapati/OffTake
ls -la | grep .env
```

## To Stop the Server

Press `Ctrl + C` in Terminal
