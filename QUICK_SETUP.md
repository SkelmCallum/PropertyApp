# Quick MCP Setup with Your Tokens

## Your Tokens (Keep These Secure!)

- **Vercel Token**: `Pssa1JAM7GKG1ugIBntfp5bb`
- **Supabase Token**: `sbp_591c3f0fa93c1bdc8f2e38112038c8da53acfeeb`
- **Supabase Project Ref**: ⚠️ **NEEDED** - See instructions below

## Step 1: Get Your Supabase Project Reference

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to **Settings** → **General**
4. Find the **Reference ID** (it looks like: `abcdefghijklmnop`)
5. Or check your project URL: `https://supabase.com/dashboard/project/[REFERENCE_ID]/...`

## Step 2: Configure in Cursor

### Option A: Using Cursor Settings UI (Recommended)

1. Open Cursor Settings:
   - Press `Ctrl+,` (Windows) or `Cmd+,` (Mac)
   - Or go to **File** → **Preferences** → **Settings

2. Search for "MCP" in the settings search bar

3. Add Vercel MCP Server:
   - Click "Add MCP Server" or similar
   - **Name**: `vercel`
   - **Command**: `npx`
   - **Args**: `-y @vercel/mcp-server-vercel@latest`
   - **Environment Variables**:
     - Key: `VERCEL_ACCESS_TOKEN`
     - Value: `Pssa1JAM7GKG1ugIBntfp5bb`

4. Add Supabase MCP Server:
   - Click "Add MCP Server"
   - **Name**: `supabase`
   - **Command**: `npx`
   - **Args**: `-y @supabase/mcp-server-supabase@latest --read-only --project-ref=YOUR_PROJECT_REF_HERE`
   - **Environment Variables**:
     - Key: `SUPABASE_ACCESS_TOKEN`
     - Value: `sbp_591c3f0fa93c1bdc8f2e38112038c8da53acfeeb`

5. Replace `YOUR_PROJECT_REF_HERE` with your actual Supabase project reference

### Option B: Using System Environment Variables

Set these in your system environment variables (Windows):

```powershell
# In PowerShell (run as Administrator)
[System.Environment]::SetEnvironmentVariable("VERCEL_ACCESS_TOKEN", "Pssa1JAM7GKG1ugIBntfp5bb", "User")
[System.Environment]::SetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "sbp_591c3f0fa93c1bdc8f2e38112038c8da53acfeeb", "User")
[System.Environment]::SetEnvironmentVariable("SUPABASE_PROJECT_REF", "YOUR_PROJECT_REF_HERE", "User")
```

Then use the `mcp-config-template.json` configuration.

## Step 3: Restart Cursor

After configuring, restart Cursor completely to load the MCP servers.

## Step 4: Verify

1. Open Cursor Settings → MCP
2. You should see both `vercel` and `supabase` servers listed
3. They should show as "Connected" or "Active"

## Security Reminder

⚠️ **Never commit these tokens to Git! They're already in this file for your reference, but make sure this file is in `.gitignore` if you're using version control.**

