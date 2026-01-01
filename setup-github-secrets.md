# GitHub Secrets Setup

Your Edge Function is now deployed! ✅

**Function URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-properties`

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. SUPABASE_URL
- **Value:** `https://YOUR_PROJECT_REF.supabase.co`
- **Where to add:** https://github.com/SkelmCallum/PropertyApp/settings/secrets/actions

### 2. SUPABASE_SERVICE_ROLE_KEY
- **How to get it:**
  1. Go to: https://app.supabase.com/project/YOUR_PROJECT_REF/settings/api
  2. Scroll to "Project API keys"
  3. Find the **service_role** key (⚠️ Keep this secret!)
  4. Copy the key (starts with `eyJ...`)
- **Where to add:** https://github.com/SkelmCallum/PropertyApp/settings/secrets/actions

## Quick Setup Steps

1. Go to: https://github.com/SkelmCallum/PropertyApp/settings/secrets/actions
2. Click **"New repository secret"**
3. Add `SUPABASE_URL` with value: `https://YOUR_PROJECT_REF.supabase.co`
4. Click **"New repository secret"** again
5. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key from Supabase

## After Adding Secrets

Once secrets are added, test the workflow:
1. Go to: https://github.com/SkelmCallum/PropertyApp/actions
2. Click "Scrape Properties" workflow
3. Click "Run workflow" → "Run workflow"
4. Check the logs to verify it works!

