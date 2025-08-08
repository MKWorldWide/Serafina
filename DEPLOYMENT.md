# Serafina Deployment Guide for Render

This guide will walk you through deploying Serafina and its backend services to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. A GitHub account with access to this repository
3. Discord bot token and any other required API keys

## Deployment Steps

### 1. Fork and Clone the Repository

Fork this repository to your GitHub account, then clone it locally:

```bash
git clone https://github.com/your-username/GameDinDiscord.git
cd GameDinDiscord
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token

# Service Ports (these should match the ports in render.yaml)
SHADOW_NEXUS_PORT=10000
ATHENA_CORE_PORT=10001
DIVINA_PORT=10002

# Service URLs (update these after deployment)
SHADOW_NEXUS_URL=http://your-render-app.onrender.com
ATHENACORE_URL=http://your-render-app.onrender.com
DIVINA_URL=http://your-render-app.onrender.com
```

### 3. Deploy to Render

#### Option A: Using Render Dashboard

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Click "New" and select "Web Service"
3. Connect your GitHub account and select the forked repository
4. Configure the service:
   - Name: `serafina-bot`
   - Region: Choose the one closest to you
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add the environment variables from your `.env` file
6. Click "Create Web Service"

#### Option B: Using Render CLI

1. Install the Render CLI:
   ```bash
   npm install -g @renderinc/cli
   ```
2. Log in to Render:
   ```bash
   render login
   ```
3. Deploy the services:
   ```bash
   render deploy
   ```

### 4. Configure the Services

After deployment, you'll need to update the service URLs in your Discord bot's environment variables to point to your Render URLs.

### 5. Verify the Deployment

1. Check the logs in the Render dashboard for any errors
2. Invite the bot to your Discord server using the OAuth2 URL
3. Test the bot's functionality in your Discord server

## Updating the Deployment

To update your deployment:

1. Push your changes to the `main` branch
2. Render will automatically detect the changes and trigger a new deployment
3. Monitor the deployment status in the Render dashboard

## Troubleshooting

- **Build Failures**: Check the build logs in the Render dashboard for specific error messages
- **Service Not Starting**: Verify all environment variables are set correctly
- **High Memory Usage**: Consider upgrading your Render plan if you experience memory issues

## Monitoring

- Use the Render dashboard to monitor your services
- Check the logs for any errors or warnings
- Set up alerts for service downtimes

## Scaling

By default, Render will scale your services based on demand. You can adjust the scaling settings in the Render dashboard if needed.
