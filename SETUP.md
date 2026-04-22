# My Board — Setup Guide

Everything below is free. No credit card needed for any of it.

---

## What you'll need first

- [ ] A free account at **github.com** (you already have one)
- [ ] A free account at **supabase.com** (takes 2 minutes)
- [ ] **Node.js** installed on your computer → download at nodejs.org (click the "LTS" button)

---

## PART 1 — Supabase (your database)

### 1. Create a Supabase account
Go to **supabase.com** → click **Start your project** → sign in with GitHub.

### 2. Create a new project
- Click **New project**
- Give it a name like `myboard`
- Pick any region (closest to you)
- Set a database password (save it somewhere, though you won't need it often)
- Click **Create new project** — takes about a minute to spin up

### 3. Create the database table
Once your project is ready:
- Click **SQL Editor** in the left sidebar
- Click **New query**
- Paste this exactly and click **Run**:

```sql
create table boards (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Allow anyone with your anon key to read/write (fine for personal use)
alter table boards enable row level security;

create policy "Allow all" on boards
  for all using (true) with check (true);
```

### 4. Get your API keys
- Click **Project Settings** (gear icon, bottom left)
- Click **API**
- Copy two things:
  - **Project URL** — looks like `https://xyzxyz.supabase.co`
  - **anon public** key — a long string starting with `eyJ...`

### 5. Paste your keys into the app
Open the file `src/supabase.js` and replace the placeholders:

```js
const SUPABASE_URL  = 'https://xyzxyz.supabase.co'   // ← your URL here
const SUPABASE_ANON = 'eyJhbGci...'                   // ← your anon key here
```

---

## PART 2 — GitHub (your code + free hosting)

### 6. Create a new repository
- Go to **github.com** → click the **+** icon top right → **New repository**
- Name it exactly: `myboard`
- Set it to **Public** (required for free GitHub Pages hosting)
- Do NOT check "Add a README" — leave it empty
- Click **Create repository**

### 7. Update the base path in vite.config.js
Open `vite.config.js` and make sure the base matches your repo name:
```js
base: '/myboard/',   // ← must match your GitHub repo name exactly
```

### 8. Install Node.js (if you haven't yet)
- Go to **nodejs.org**
- Click the big **LTS** button to download
- Install it like any other app

### 9. Upload your code to GitHub
Open **Terminal** (Mac) or **Command Prompt** (Windows), then run these
commands one by one. Replace `YOUR_GITHUB_USERNAME` with your actual username.

```bash
# Go into the project folder
cd path/to/myboard

# Install the app's dependencies
npm install

# Set up git
git init
git add .
git commit -m "first commit"

# Connect to GitHub and push
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/myboard.git
git branch -M main
git push -u origin main
```

> 💡 If it asks for a GitHub password, use a **Personal Access Token** instead.
> Get one at: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → check "repo" → copy it.

### 10. Enable GitHub Pages
- Go to your repo on github.com
- Click **Settings** tab
- Click **Pages** in the left sidebar
- Under **Source**, select **GitHub Actions**
- Save

### 11. Wait for the first deploy
- Click the **Actions** tab on your repo
- You'll see a workflow running called "Deploy to GitHub Pages"
- Wait ~1 minute for it to finish (green checkmark = done)

### 12. Open your app!
Your app is now live at:
```
https://YOUR_GITHUB_USERNAME.github.io/myboard/
```

Bookmark this on your iPhone and add it to your home screen:
- Open the URL in Safari
- Tap the **Share** button (box with arrow)
- Tap **Add to Home Screen**
- Done — it'll look and feel like a real app!

---

## Future updates

Whenever you make changes to your code and want to push them live:

```bash
git add .
git commit -m "describe what you changed"
git push
```

GitHub Actions will automatically rebuild and redeploy within about a minute.

---

## Troubleshooting

**App loads but data doesn't save**
→ Check that your Supabase URL and anon key are pasted correctly in `src/supabase.js`
→ Make sure you ran the SQL to create the `boards` table

**GitHub Pages shows a blank page**
→ Make sure the `base` in `vite.config.js` matches your repo name exactly (including capitalization)

**Git push asks for a password**
→ Use a Personal Access Token, not your GitHub password (see Step 9 above)
