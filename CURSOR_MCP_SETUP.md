# How to Add GitHub MCP Server in Cursor IDE

If you don't see the GitHub MCP server in Cursor, follow these steps to add it manually:

## Step 1: Open Cursor Settings

1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Or go to **File** → **Preferences** → **Settings**

## Step 2: Find MCP Configuration

1. In the Settings search bar, type: `MCP`
2. Look for **"MCP Servers"** or **"Model Context Protocol"** section
3. If you don't see it, try:
   - **Extensions** → **MCP**
   - Or check **Cursor Settings** → **Features** → **MCP**

## Step 3: Add GitHub Server

### Option A: Using Docker (Official GitHub MCP Server - Recommended)

1. Click **"Add Server"** or the **"+"** button
2. Fill in the configuration:

   **Server Name:** `github`

   **Command:** `docker`

   **Arguments:** 
   ```
   run
   -i
   --rm
   -e
   GITHUB_PERSONAL_ACCESS_TOKEN
   ghcr.io/github/github-mcp-server
   ```

   **Environment Variables:**
   - Key: `GITHUB_PERSONAL_ACCESS_TOKEN`
   - Value: `your_github_token_here` (get from https://github.com/settings/tokens)

3. Click **Save**

**Note:** Make sure Docker Desktop is installed and running on your system.

### Option B: Using NPM (If Docker is not available)

1. Click **"Add Server"** or the **"+"** button
2. Fill in the configuration:

   **Server Name:** `github`

   **Command:** `npx`

   **Arguments:** 
   ```
   -y
   @ama-mcp/github@latest
   ```

   **Environment Variables:**
   - Key: `GITHUB_PERSONAL_ACCESS_TOKEN`
   - Value: `your_github_token_here` (get from https://github.com/settings/tokens)

3. Click **Save**

## Step 4: Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. The GitHub MCP server should now be available

## Step 5: Verify It's Working

1. Go back to Settings → MCP
2. You should see `github` listed as a connected server
3. Try asking the AI assistant to check your GitHub repositories or workflow runs

## Troubleshooting

### "Docker not found" error
- Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Make sure Docker Desktop is running before starting Cursor

### "Server not connecting"
- Check that your GitHub token is correct
- Verify the token hasn't expired
- Make sure the token has the right permissions (repo, read:org, read:user)

### "MCP section not visible"
- Update Cursor to the latest version
- MCP support might require Cursor Pro or a specific version
- Check Cursor's documentation for MCP support

### Still not working?
- Try the NPM-based option (Option B) instead of Docker
- Check Cursor's console/logs for error messages
- Make sure your token has the `repo` scope enabled

## Manual Configuration File (Advanced)

If Cursor uses a configuration file, you can also edit it directly. The location is typically:
- Windows: `%APPDATA%\Cursor\User\settings.json`
- Mac: `~/Library/Application Support/Cursor/User/settings.json`
- Linux: `~/.config/Cursor/User/settings.json`

Add this to the `mcp.servers` section:

```json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "GITHUB_PERSONAL_ACCESS_TOKEN",
          "ghcr.io/github/github-mcp-server"
        ],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
        }
      }
    }
  }
}
```

**⚠️ Security Warning:** If you edit the settings file directly, make sure it's not committed to git!

