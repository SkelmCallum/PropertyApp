# GitHub Actions Setup for Automated Scraping

This guide explains how to set up GitHub Actions to automatically scrape properties every 6 hours.

## Prerequisites

- Your code must be in a GitHub repository
- You need access to your Supabase project settings

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role key** (⚠️ Keep this secret! It has admin access)

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1: `SUPABASE_URL`**
   - Name: `SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   **Secret 2: `SUPABASE_SERVICE_ROLE_KEY`**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your Supabase service_role key (starts with `eyJ...`)

4. Click **Add secret** for each one

## Step 3: Verify the Workflow

1. Go to the **Actions** tab in your GitHub repository
2. You should see the "Scrape Properties" workflow
3. The workflow will automatically run:
   - Every 6 hours (at 00:00, 06:00, 12:00, 18:00 UTC)
   - Or manually when you click "Run workflow"

## Step 4: Test the Workflow

1. Go to **Actions** → **Scrape Properties**
2. Click **Run workflow** → **Run workflow** (green button)
3. Wait for the workflow to complete (usually takes 1-2 minutes)
4. Check the logs to see if it was successful

## Schedule Customization

To change the scraping frequency, edit `.github/workflows/scrape-properties.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

Common schedules:
- `'0 */6 * * *'` - Every 6 hours
- `'0 */12 * * *'` - Every 12 hours
- `'0 0 * * *'` - Daily at midnight UTC
- `'0 0,12 * * *'` - Twice daily (midnight and noon UTC)
- `'0 0 * * 0'` - Weekly on Sunday at midnight UTC

## Troubleshooting

### Workflow not running automatically
- Check that the workflow file is in `.github/workflows/` directory
- Verify the cron syntax is correct
- Note: Scheduled workflows only run on the default branch (usually `main` or `master`)

### Authentication errors
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Make sure you're using the **service_role** key, not the **anon** key
- Check that the key hasn't expired or been rotated

### Edge Function not found
- Make sure you've deployed the Edge Function:
  ```bash
  supabase functions deploy scrape-properties
  ```
- Verify the function name matches: `scrape-properties`

### Rate limiting
- If you're scraping too frequently, you might hit rate limits
- Consider increasing the interval between runs
- Check the Edge Function logs in Supabase Dashboard

## Manual Triggering

You can trigger scraping manually at any time:

1. Go to **Actions** tab
2. Click **Scrape Properties** workflow
3. Click **Run workflow** button
4. Select the branch (usually `main`)
5. Click **Run workflow**

## Monitoring

- View workflow runs in the **Actions** tab
- Check logs for each run to see scraping results
- Monitor your Supabase database to see new properties being added

## Security Notes

- ⚠️ Never commit secrets to your repository
- The `SUPABASE_SERVICE_ROLE_KEY` has admin access - keep it secure
- Only add secrets through GitHub's Secrets interface
- Consider rotating keys periodically

## Free Tier Limits

**Public Repositories:**
- ✅ Unlimited workflow runs
- ✅ Unlimited minutes

**Private Repositories:**
- ✅ 2,000 minutes/month free
- ✅ Each scraping run uses ~1-2 minutes
- ✅ You can run ~1,000-2,000 times per month

If you exceed the limit, you can:
- Upgrade to GitHub Pro ($4/month)
- Use a different scheduling service (EasyCron, cron-job.org)
- Reduce scraping frequency

