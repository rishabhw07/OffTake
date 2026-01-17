# OffTake - Privacy-First Procurement Platform

A secure, production-ready two-sided procurement platform for materials focused on RFQs and long-term offtake agreements. All listings are anonymous until mutual opt-in, protecting sensitive relationships, pricing, and sourcing strategies.

**🔒 Fully Secured**: HTTPS encryption, security headers, rate limiting, and secure authentication  
**🌐 Production Ready**: Deploy to Vercel, Railway, or any cloud platform  
**🔐 Privacy First**: Anonymous listings with mutual opt-in for deanonymization

## Features

- **Privacy-First Design**: All listings are anonymous by default
- **RFQ Management**: Manufacturers can post RFQs with detailed specifications
- **Offtake Baselines**: Support for recurring long-term agreements
- **Supply Listings**: Suppliers can post available materials
- **Smart Matching**: Automatic matching between demand and supply
- **Mutual Opt-In**: Deanonymization only after both parties agree
- **Negotiation Support**: Built-in negotiation and agreement closing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Environment variables configured

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update the connection string in your `.env` file:

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="postgresql://user:password@localhost:5432/offtake?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### For Manufacturers

1. **Sign Up** as a Manufacturer
2. **Create RFQs** or **Offtake Baselines** with:
   - Material type and grade
   - Technical specifications
   - Compliance requirements
   - Delivery terms (incoterms, location, schedule)
   - Target price or pricing formula
3. **View Matches** with potential suppliers
4. **Request Contact** when interested in a match
5. **Negotiate** after mutual opt-in
6. **Close Agreements** when terms are finalized

### For Suppliers

1. **Sign Up** as a Supplier
2. **Create Supply Listings** with:
   - Material type and grade
   - Available volumes over time
   - Quality certifications
   - Preferred delivery modes
   - Pricing structures
3. **View Matches** with manufacturer RFQs/baselines
4. **Request Contact** when interested in a match
5. **Negotiate** after mutual opt-in
6. **Close Agreements** when terms are finalized

## Project Structure

```
OffTake/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities (Prisma, Auth)
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript types
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/rfqs` - Create RFQ
- `GET /api/rfqs` - List RFQs
- `POST /api/offtake-baselines` - Create offtake baseline
- `POST /api/supply-listings` - Create supply listing
- `GET /api/matches` - Get matches
- `POST /api/contact-requests` - Request contact
- `POST /api/contact-requests/[id]/accept` - Accept contact request
- `POST /api/negotiations` - Create negotiation
- `POST /api/agreements` - Create agreement
- `POST /api/agreements/[id]/execute` - Execute agreement

## Development

```bash
# Run development server
npm run dev

# Generate Prisma client after schema changes
npm run db:generate

# Push database changes
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Production Deployment

**For secure, production-ready deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/offtake.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "Add New Project" → Import your GitHub repo
   - Add environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)
     - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - Click "Deploy"

3. **Initialize Database**
   ```bash
   export DATABASE_URL="your-production-database-url"
   npx prisma db push
   ```

Your app will be live with automatic HTTPS, global CDN, and security features enabled!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and alternative platforms.

## Security Notes

- All passwords are hashed using bcrypt
- Session management via NextAuth.js
- Anonymous listings protect sensitive business information
- Mutual opt-in required before deanonymization
- Role-based access control for API endpoints

## License

MIT
