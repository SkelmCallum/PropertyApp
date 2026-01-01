# Workflow Setup Validation Checklist

Use this checklist to ensure your GitHub Actions workflow is properly configured:

## ✅ Prerequisites Checklist

### 1. Edge Function Deployed
- [ ] Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Edge Functions
- [ ] Verify `scrape-properties` function is listed and deployed
- [ ] If not deployed, follow instructions in `DEPLOY_EDGE_FUNCTION.md`

### 2. GitHub Secrets Configured
- [ ] Go to: https://github.com/SkelmCallum/PropertyApp/settings/secrets/actions
- [ ] Verify `SUPABASE_URL` secret exists
  - Should be: `https://YOUR_PROJECT_REF.supabase.co`
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` secret exists
  - Should start with: `eyJ...`
  - Must be the **service_role** key, not anon key

### 3. Workflow File Present
- [x] `.github/workflows/scrape-properties.yml` exists
- [x] Workflow is committed to `main` branch

## 🧪 Testing Steps

### Step 1: Test Locally (Optional)
Run the test script to verify your setup:
```powershell
# Set your environment variables first
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the test
powershell -ExecutionPolicy Bypass -File test-workflow.ps1
```

### Step 2: Test on GitHub
1. Go to: https://github.com/SkelmCallum/PropertyApp/actions
2. Click "Scrape Properties" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait 1-2 minutes
5. Check the logs

## 🔍 Common Issues & Fixes

### Issue: 404 Error - Function Not Found
**Fix:** Deploy the Edge Function
```bash
# Get your Supabase access token from: https://app.supabase.com/account/tokens
$env:SUPABASE_ACCESS_TOKEN="your-access-token"
npx supabase functions deploy scrape-properties --project-ref YOUR_PROJECT_REF
```

### Issue: 401/403 Error - Authentication Failed
**Fix:** Check your secrets
- Verify `SUPABASE_SERVICE_ROLE_KEY` is the service_role key (not anon)
- Make sure the key hasn't expired
- Check for extra spaces or newlines in the secret

### Issue: Secret Not Found
**Fix:** Add the secrets to GitHub
- Go to: https://github.com/SkelmCallum/PropertyApp/settings/secrets/actions
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## 📊 Expected Success Output

When the workflow succeeds, you should see:
```
✅ Scraping job triggered successfully!
Response HTTP Code: 200
Response Body: {
  "success": true,
  "job_id": "...",
  "properties_found": X,
  "properties_added": Y,
  "properties_updated": Z
}
```

## 🚀 Next Steps After Setup

Once everything is working:
1. The workflow will run automatically every 6 hours
2. Monitor runs in the Actions tab
3. Check Supabase database for new properties
4. Review logs if any issues occur

