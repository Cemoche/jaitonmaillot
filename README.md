# J'ai ton maillot

A lightweight community utility to help reconnect misplaced KC jerseys caused by logistical errors (e.g. incorrect shirt shipping or wrong personalization).

## The Concept

Users search for the name (flocage) they were supposed to receive or received incorrectly, and discover if someone else has declared it.

- No complex matching system
- No social network logic
- Just a fast, searchable registry

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: X (Twitter) OAuth 2.0

## Features

- **Instant search** by flocage name
- **X (Twitter) OAuth login** — one jersey per user
- **Declare a jersey** you received by mistake
- **Edit or delete** your declaration
- **Photo upload** with modal lightbox view
- **Clickable photos** in search results
- **Admin moderation** — approve/reject declarations
- **Basic rate limiting** (10 insertions/minute)
- **MIT License**

## User Flow

1. **Search**: Enter the flocage on your jersey to find who received it
2. **Declare**: Log in with X and declare the jersey you received by mistake
3. **Connect**: Contact the owner via their X profile link

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create an account/project
2. In the SQL Editor, run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to Project Settings > API and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Publishable` API key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Configure X (Twitter) OAuth

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable **X / Twitter (OAuth 2.0)**
3. Add your X API credentials (Client ID and Client Secret)
4. Set the callback URL in your X Developer app: `https://<your-project>.supabase.co/auth/v1/callback`

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials.

### 4. Run the project

```bash
npm run dev
```

## Project Structure

```
src/
  app/
    page.tsx          # Homepage with search
    declare/page.tsx  # Jersey declaration & edit form
    admin/page.tsx    # Admin moderation dashboard
    layout.tsx        # Root layout
    globals.css       # Global styles
  components/
    ui/               # shadcn/ui components
    auth-button.tsx   # Authentication button
  hooks/
    use-auth.ts       # Auth state management
  lib/
    supabase.ts       # Supabase client
    database.types.ts # TypeScript types
    utils.ts          # Utilities
supabase/
  migrations/         # SQL migrations
```

## Admin Moderation

To prevent trolls and NSFW content, all declarations require manual approval before appearing in search results.

### How it works

1. Users submit a declaration
2. The declaration is marked as `approved = false` (pending)
3. Admins review pending declarations at `/admin`
4. Approved declarations appear in search results; rejected ones are deleted

### Setup admin access

1. Log in to the app with your X account (to create your user record)
2. Get your user ID from the Supabase dashboard (Auth > Users)
3. Run this SQL in the Supabase SQL Editor:

```sql
INSERT INTO public.admins (user_id)
VALUES ('your-user-id-here');
```

4. Visit `/admin` to access the moderation dashboard

### Admin features

- View all pending declarations
- Approve: Makes the jersey visible in search results
- Reject: Permanently deletes the declaration
- See submission date, flocage, size, photo, and Twitter handle

## License

MIT License — see [LICENSE](LICENSE) file.
