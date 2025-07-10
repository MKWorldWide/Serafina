# 🎮 GameDin Discord Bot - Setup Guide for Your Server

## 🎯 Quick Setup for https://discord.gg/snwv9dbq

### Step 1: Get Discord Bot Credentials

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Create New Application**:
   - Click "New Application"
   - Name it "GameDin Bot"
   - Click "Create"

3. **Create Bot**:
   - Go to "Bot" section in the left sidebar
   - Click "Add Bot"
   - Click "Yes, do it!"

4. **Get Bot Token**:
   - In the Bot section, click "Reset Token"
   - Copy the token (keep it secret!)

5. **Get Client ID**:
   - Go to "General Information"
   - Copy the "Application ID"

6. **Get Server ID**:
   - In your Discord server, enable Developer Mode:
     - User Settings → Advanced → Developer Mode
   - Right-click your server name → "Copy Server ID"

### Step 2: Configure Environment

Edit your `.env` file with the real values:

```bash
# Discord Bot Configuration
DISCORD_TOKEN=MTM0MTkzNzY1NTA1MDY3MDA4MA.Gkph2_.Pdw5ZY3URWy21eZur43hkyyVKIcN2q-xU3qnKw
DISCORD_CLIENT_ID=1341937655050670080
DISCORD_GUILD_ID=1331043745638121544
```

### Step 3: Invite Bot to Your Server

1. **Generate Invite Link**:
   - Go to "OAuth2" → "URL Generator" in Discord Developer Portal
   - Select scopes: `bot` and `applications.commands`
   - Select bot permissions:
     - Administrator (for full setup)
     - Or specific permissions: Manage Channels, Manage Roles, Send Messages, etc.
   - Copy the generated URL

2. **Invite Bot**:
   - Open the generated URL in your browser
   - Select your server
   - Authorize the bot

### Step 4: Deploy Commands

```bash
npm run deploy-commands
```

### Step 5: Start the Bot

```bash
npm start
```

### Step 6: Initialize Server

In your Discord server, use the `/setup` command to create channels and roles.

## 🚀 Commands Available

- `/setup` - Initialize server with channels and roles
- `/ping` - Test bot connectivity
- `/help` - Show available commands
- `/moderate` - Moderation tools
- `/xp` - XP system commands

## 🔧 Troubleshooting

### "401 Unauthorized" Error
- Check that your bot token is correct
- Make sure the bot is invited to your server
- Verify the client ID matches your application

### "Missing Permissions" Error
- Ensure the bot has the required permissions
- Check that the bot role is above the roles it needs to manage

### Bot Not Responding
- Check that the bot is online
- Verify the bot has permission to read messages in the channel
- Check the console for error messages

## 📞 Support

If you need help:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure the bot has proper permissions in your server

## 🎯 Next Steps

Once the bot is running:
1. Use `/setup` to create your server structure
2. Test the moderation features
3. Configure XP system settings
4. Customize welcome messages and roles

---

**Your Server**: https://discord.gg/snwv9dbq
**Bot Status**: Ready for deployment once credentials are configured 