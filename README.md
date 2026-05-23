# MillionaireOS Next.js Full

This is a web version of MillionaireOS with:

- Supabase login/register
- Dashboard
- Habits CRUD
- Finance CRUD
- Career CRUD
- Fitness CRUD
- Mindset CRUD
- AI Coach with database save
- Progress page
- Achievements page
- Weekly Review page
- XP and level system

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Deploy

Push to GitHub, then import the repo into Vercel.

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```
