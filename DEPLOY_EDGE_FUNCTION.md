# Deploy Supabase Edge Function

Your Edge Function needs to be deployed before GitHub Actions can call it. Follow these steps:

## Option 1: Deploy via Command Line (Recommended)

### Step 1: Get Your Supabase Access Token

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click your profile icon (top right) → **Account Settings**
3. Go to **Access Tokens** section
4. Click **Generate New Token**
5. Give it a name (e.g., "Deploy Functions")
6. Copy the token (you'll only see it once!)

### Step 2: Deploy the Function

Open your terminal in the project directory and run:

**Windows (PowerShell):**
```powershell
$env:SUPABASE_ACCESS_TOKEN="your_access_token_here"
npx supabase functions deploy scrape-properties --project-ref YOUR_PROJECT_REF
```

**Windows (CMD):**
```cmd
set SUPABASE_ACCESS_TOKEN=your_access_token_here
npx supabase functions deploy scrape-properties --project-ref YOUR_PROJECT_REF
```

**Mac/Linux:**
```bash
export SUPABASE_ACCESS_TOKEN="your_access_token_here"
npx supabase functions deploy scrape-properties --project-ref YOUR_PROJECT_REF
```

Replace:
- `your_access_token_here` with the token you copied
- `YOUR_PROJECT_REF` with your Supabase project reference ID (found in your Supabase project URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`)

### Step 3: Verify Deployment

After deployment, you should see a success message. You can verify by:

1. Going to your Supabase Dashboard
2. Navigate to **Edge Functions** in the sidebar
3. You should see `scrape-properties` listed

## Option 2: Deploy via Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** in the sidebar
4. Click **Create a new function**
5. Name it `scrape-properties`
6. Copy and paste the contents of `supabase/functions/scrape-properties/index.ts`
7. Click **Deploy**

**Note:** This method requires manually copying the code, so Option 1 is recommended.

## Option 3: Use Supabase CLI (If Installed)

If you have Supabase CLI installed via other means (e.g., Scoop on Windows):

```bash
supabase login
supabase functions deploy scrape-properties
```

## Finding Your Project Reference ID

Your project reference ID is in your Supabase project URL:
- URL format: `https://app.supabase.com/project/YOUR_PROJECT_REF`
- Or check: Supabase Dashboard → Project Settings → General → Reference ID

## Troubleshooting

### "Function not found" error
- Make sure the function name matches exactly: `scrape-properties`
- Verify the function is deployed in your Supabase Dashboard

### "Access token not provided" error
- Make sure you set the `SUPABASE_ACCESS_TOKEN` environment variable
- Or use the `--token` flag: `npx supabase functions deploy scrape-properties --token YOUR_TOKEN`

### "Project not linked" error
- Link your project first: `npx supabase link --project-ref YOUR_PROJECT_REF`
- Or use the `--project-ref` flag in the deploy command

## After Deployment

Once deployed, your GitHub Actions workflow should work! Test it by:

1. Going to GitHub Actions
2. Running the "Scrape Properties" workflow manually
3. Check the logs to see if it succeeds

The function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-properties
```

