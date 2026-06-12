# 🔥 ClipViralAI — Railway Deploy Guide

## STEP 1 — Turso Database (Free)

1. **turso.tech** pe account banao (GitHub se login)
2. Terminal mein:
   ```bash
   turso db create clipviralai
   turso db show clipviralai   # URL copy karo
   turso db tokens create clipviralai  # Token copy karo
   ```
3. Yeh dono Railway environment variables mein daalo

## STEP 2 — Railway Deploy

1. **railway.app** pe GitHub se login
2. "New Project" → "Deploy from GitHub repo"
3. Apna repo select karo (ya folder upload karo)
4. "Variables" tab mein yeh sab daalo:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
JWT_SECRET=koi-bhi-long-random-string
ADMIN_EMAIL=aapki-email@gmail.com
NEXT_PUBLIC_JAZZCASH_NUMBER=03XX-XXXXXXX
NEXT_PUBLIC_EASYPAISA_NUMBER=03XX-XXXXXXX
NEXT_PUBLIC_APP_URL=https://aapki-railway-url.railway.app
```

5. Deploy hone do — pehli baar 3-5 min lagti hai
6. Deploy ke baad apni Railway URL pe jao

## STEP 3 — Admin Account

ADMIN_EMAIL wali email se register karo.
Dashboard mein 👑 Admin tab aayega.

## STEP 4 — Payment Flow

1. User payment karta hai → Transaction ID deta hai
2. Admin panel → "✓ Activate Pro" click
3. User ka Pro plan on (8 shorts/week)

## Requirements (Railway auto-install karta hai)

- Node.js 20
- ffmpeg (nixpacks se)
- yt-dlp (nixpacks se)
- Turso DB (free tier)

## Local Development

```bash
npm install
npx prisma db push   # local SQLite banao
npm run dev
```
