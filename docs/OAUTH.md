# Discord OAuth 2.0 Integration

This document explains how to set up and use the Discord OAuth 2.0 integration in the Serafina bot.

## Prerequisites

1. A Discord application with a bot user created at the [Discord Developer Portal](https://discord.com/developers/applications)
2. Node.js 18+ installed
3. Required environment variables configured (see `.env.example`)

## Setup Instructions

### 1. Configure Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to the "OAuth2" > "General" section
4. Add the following redirect URIs:
   - `http://localhost:3000/oauth/callback` (for local development)
   - `https://your-production-url.com/oauth/callback` (for production)
5. Save changes

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the following variables:

```env
# Required for OAuth
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Set to your production URL when deploying
# Example: https://your-app.herokuapp.com
BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Available OAuth Endpoints

### 1. Start OAuth Flow

```
GET /auth/discord
```

Starts the Discord OAuth flow by redirecting to Discord's authorization page.

**Optional Query Parameters:**
- `state`: A string that will be returned after authorization
- `prompt`: Either "none" or "consent" to control the Discord prompt

### 2. OAuth Callback

```
GET /oauth/callback
```

Handles the OAuth callback from Discord. This endpoint:
1. Exchanges the authorization code for an access token
2. Fetches the user's Discord profile
3. Returns the user data and tokens as JSON

### 3. Bot Invite

```
GET /auth/discord/invite
```

Generates a bot invite URL with the specified permissions.

**Query Parameters:**
- `permissions`: Discord permissions bitfield (default: 274877975552)
- `guild_id`: Pre-select a server for the invite
- `disable_guild_select`: Boolean to disable server selection

## Example Usage

### 1. Start the OAuth Flow

```bash
# Start the server
pnpm dev

# Open in browser or make a request to:
curl http://localhost:3000/auth/discord
```

### 2. Test OAuth Flow

1. Run the test script:
   ```bash
   npx tsx test-oauth.ts
   ```

2. Open the generated OAuth URL in your browser
3. Authorize the application
4. You'll be redirected to the callback URL with the user data

## Security Considerations

1. **Always** use HTTPS in production
2. Store sensitive values (tokens, client secrets) in environment variables
3. Implement proper session management in production
4. Validate all incoming requests and use CSRF protection
5. Set appropriate CORS headers

## Troubleshooting

### Common Issues

1. **Invalid OAuth2 Redirect URI**
   - Ensure the redirect URI in your Discord Developer Portal matches exactly
   - Include/exclude the trailing slash as configured

2. **Missing Permissions**
   - Verify the bot has the required OAuth2 scopes
   - Check the bot's permissions in the server

3. **Rate Limiting**
   - Discord has rate limits on OAuth endpoints
   - Implement proper error handling and retry logic

For additional help, check the server logs and ensure all environment variables are set correctly.

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Update `BASE_URL` to your production domain
3. Configure HTTPS (required for OAuth)
4. Set up proper logging and monitoring
5. Consider using a process manager like PM2

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
