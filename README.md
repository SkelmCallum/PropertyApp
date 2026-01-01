# PropertyApp

## MCP Configuration

This project is configured to use Model Context Protocol (MCP) servers for Vercel and Supabase.

### Quick Start

See [MCP_SETUP.md](./MCP_SETUP.md) for detailed setup instructions.

### MCP Servers

- **Vercel MCP**: Provides access to Vercel projects, deployments, and configurations
- **Supabase MCP**: Provides read-only access to your Supabase database schema and data

### Configuration Files

- `mcp-config-template.json` - Template configuration for MCP servers
- `MCP_SETUP.md` - Detailed setup guide with step-by-step instructions

### Security Notes

- Never commit access tokens to version control
- Keep your access tokens secure and rotate them regularly
- Use read-only tokens when possible

