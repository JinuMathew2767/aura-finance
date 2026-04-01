# Aura Finance

Aura Finance is a household finance dashboard built with Next.js, Tailwind CSS, and Supabase-backed API routes.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase for database
- Vercel for hosting

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Environment Variables

Create a local `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`NEXT_PUBLIC_SUPABASE_URL` is safe to expose to the browser.

`SUPABASE_SERVICE_ROLE_KEY` must only be stored in server-side environments such as Vercel project settings. Do not expose it in client code.

## Supabase Setup

This repo already includes SQL migrations in [supabase/migrations](./supabase/migrations).

Recommended setup:

1. Create a free Supabase project.
2. Open the SQL editor in Supabase.
3. Run these migration files in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_card_triggers.sql`
   - `supabase/migrations/20240101000002_seed_data.sql`
4. Copy your project URL and service role key into Vercel environment variables.

The seed migration creates the two demo users used by the current login screen:

- `11111111-1111-1111-1111-111111111111`
- `22222222-2222-2222-2222-222222222222`

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Framework preset: `Next.js`
4. Add these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Deploy.

After the first deploy, every push to the tracked branch will create a new Vercel deployment.

## Important Note About Auth

The current app uses a lightweight demo-style local login flow, not Supabase Auth yet.

- The login page stores a selected user id in local storage.
- API routes read that value through the `x-user-id` header.
- Supabase is currently used as the database, not as the authentication provider.

That means this app can be hosted on Vercel with Supabase today, but if you want real sign-in, account security, and multi-user access control, the next step would be migrating authentication to Supabase Auth.

## Verification

Current verified commands:

```bash
npm run lint
npm run build
```
