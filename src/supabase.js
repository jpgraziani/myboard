import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
// STEP: Paste your Supabase project URL and anon key here.
// You'll get these from: supabase.com → your project → Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://xpvzlriymjacoiiuihen.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwdnpscml5bWphY29paXVpaGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDc0NDMsImV4cCI6MjA5MjM4MzQ0M30.wCNk7mu6KcYrnLT2jxm1-CacoJpwlwPDdb4CaR2ElHs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
