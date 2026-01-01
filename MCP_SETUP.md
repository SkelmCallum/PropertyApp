# MCP Setup Guide for Vercel, Supabase, and GitHub

This guide will help you configure Model Context Protocol (MCP) servers for Vercel, Supabase, and GitHub in Cursor.

## Quick Setup

### Option 1: Using Cursor Settings UI

1. Open Cursor Settings (Ctrl+, or Cmd+,)
2. Navigate to **MCP** or **Extensions** section
3. Add the following MCP servers:

#### Vercel MCP Server
- **Name**: `vercel`
- **Command**: `npx`
- **Args**: `-y @vercel/mcp-server-vercel@latest`
- **Environment Variables**:
  - `VERCEL_ACCESS_TOKEN`: Your Vercel access token

#### Supabase MCP Server
- **Name**: `supabase`
- **Command**: `npx`
- **Args**: `-y @supabase/mcp-server-supabase@latest --read-only --project-ref=YOUR_PROJECT_REF`
- **Environment Variables**:
  - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
  - `SUPABASE_PROJECT_REF`: Your Supabase project reference

#### GitHub MCP Server (Official - Docker-based)
- **Name**: `github`
- **Command**: `docker`
- **Args**: `run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server`
- **Environment Variables**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: Your GitHub personal access token

**Prerequisites:** Docker must be installed and running on your system.

**Alternative (NPM-based, if Docker is not available):**
- **Name**: `github`
- **Command**: `npx`
- **Args**: `-y @ama-mcp/github@latest`
- **Environment Variables**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: Your GitHub personal access token

### Option 2: Using Configuration File

If Cursor supports project-level MCP configuration, you can use the `mcp-config-template.json` file as a reference. Copy it to the appropriate location (typically `.cursor/mcp.json` or in Cursor's settings directory).

## Getting Your Credentials

### Vercel Access Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name (e.g., "MCP Server")
4. Copy the token and set it as `VERCEL_ACCESS_TOKEN`

### Supabase Access Token
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
2. Click "Generate New Token"
3. Give it a name and appropriate scopes
4. Copy the token and set it as `SUPABASE_ACCESS_TOKEN`

### Supabase Project Reference
1. Go to your [Supabase Project Settings](https://supabase.com/dashboard/project/_/settings/general)
2. Find your "Reference ID" (it's in the URL or in the project settings)
3. Use this as `SUPABASE_PROJECT_REF`

### GitHub Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name (e.g., "MCP Server")
4. Select the following scopes:
   - `repo` - Full control of private repositories (if you need private repo access)
   - `read:org` - Read org and team membership (if you need org access)
   - `read:user` - Read user profile data
   - `read:packages` - Download packages from GitHub Package Registry
5. Click **Generate token**
6. Copy the token immediately (you'll only see it once!)
7. Set it as `GITHUB_PERSONAL_ACCESS_TOKEN`

## Environment Variables

Set these environment variables in your system or in Cursor's environment:

```bash
VERCEL_ACCESS_TOKEN=your_vercel_token_here
SUPABASE_ACCESS_TOKEN=your_supabase_token_here
SUPABASE_PROJECT_REF=your_project_ref_here
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here
```

## Verification

After setup:
1. Restart Cursor
2. Check Settings > MCP to verify both servers are connected
3. Try using MCP features in your AI interactions

## Features Available

### Vercel MCP
- View projects and deployments
- Check deployment status
- Access project configurations
- View logs and metrics

### Supabase MCP
- Read database schema
- Query database (read-only)
- View table structures
- Access project information

### GitHub MCP
- View repositories and branches
- Read issues and pull requests
- Access commit history
- View workflow runs and status
- Read file contents
- Search repositories and code

## Troubleshooting

- **Server not connecting**: Check that your access tokens are valid and have the correct permissions
- **Environment variables not found**: Ensure variables are set in your system environment or Cursor's settings
- **Permission errors**: Verify your tokens have the necessary scopes/permissions

## Security Notes

- Never commit access tokens to version control
- Rotate tokens regularly
- Use read-only tokens when possible (Supabase MCP is read-only by default)
- Review token permissions and scopes

