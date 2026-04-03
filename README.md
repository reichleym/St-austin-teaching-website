This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Program search API requires a Postgres connection string. Add one of the following to `.env.local`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
# or
POSTGRES_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
# or (Vercel Postgres defaults)
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
# or project-specific keys:
st_austin_teaching_platform_DATABASE_URL=...
st_austin_teaching_platform_POSTGRES_URL=...
st_austin_teaching_platform_PRISMA_DATABASE_URL=...
# or uppercase versions (recommended for Vercel UI):
ST_AUSTIN_TEACHING_PLATFORM_DATABASE_URL=...
ST_AUSTIN_TEACHING_PLATFORM_POSTGRES_URL=...
ST_AUSTIN_TEACHING_PLATFORM_PRISMA_DATABASE_URL=...
```

Without one of these values, `/api/courses` will return HTTP `503`.

## Donation Payment Integration

Donation form submits to `POST /api/donations`.

- `mtn_mobile_money`: Jengupay checkout for MTN Mobile Money.
- `orange_money`: Jengupay checkout for Orange Money.
- `credit_card`: Jengupay (preferred) or Stripe card checkout.
- `bank_transfer`: Stripe bank checkout (`us_bank_account`) when Stripe is active.
- `cash`: API still supports manual verification mode.

Optional environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_or_live_key
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Jengupay (Cameroon)
JENGUPAY_SECRET_KEY=your-jengupay-secret
# optional if your account uses api-key style auth
JENGUPAY_API_KEY=your-jengupay-api-key
# optional override
JENGUPAY_API_URL=https://api.jengupay.com/v1/payments/checkout
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# St-austin-teaching-website
