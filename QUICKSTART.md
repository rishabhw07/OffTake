# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/offtake?schema=public"

# NextAuth - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 3: Set Up PostgreSQL Database

You need a PostgreSQL database. Options:

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb offtake
```

### Option B: Use a Cloud Database (Recommended for Quick Start)
- **Supabase**: https://supabase.com (free tier available)
- **Railway**: https://railway.app (free tier available)
- **Neon**: https://neon.tech (free tier available)

Copy the connection string to your `.env` file.

## Step 4: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push
```

## Step 5: Start the Development Server

```bash
npm run dev
```

## Step 6: Open in Browser

Visit: **http://localhost:3000**

## First Steps

1. **Sign Up** - Create an account as either a Manufacturer or Supplier
2. **Create Listings**:
   - Manufacturers: Create RFQs or Offtake Baselines
   - Suppliers: Create Supply Listings
3. **View Matches** - The system automatically matches compatible listings
4. **Request Contact** - When you find an interesting match
5. **Mutual Opt-In** - Both parties must accept to reveal identities
6. **Negotiate & Close** - Finalize agreements

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### Port Already in Use
- Change the port: `npm run dev -- -p 3001`
- Or kill the process using port 3000

### Prisma Errors
- Run `npm run db:generate` again
- Check your database connection
- Verify schema syntax

## Need Help?

Check the main README.md for more detailed information.
