# 🚀 GameDin Discord Server - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. 📝 Configure Environment

Edit the `.env` file with your Discord bot credentials:

```bash
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here
```

### 2. 🏗️ Create Discord Server

1. Open Discord and create a new server
2. Name it: **"GameDin - Sacred Gaming Community"**
3. Copy the server ID (right-click server name → Copy Server ID)

### 3. 🤖 Set Up Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create/select your GameDin application
3. Go to **Bot** section and copy the token
4. Go to **OAuth2** → **URL Generator**
5. Select scopes: `bot` and `applications.commands`
6. Select permissions (see full guide for details)
7. Use the generated link to invite bot to your server

### 4. 🚀 Deploy Bot

```bash
# Install dependencies (if not done)
npm install

# Build the bot
npm run build

# Deploy slash commands
npm run deploy-commands

# Start the bot
npm run dev
```

### 5. 🎯 Initialize Server

In your Discord server, use the slash command:

```
/setup
```

The bot will automatically create:

- ✅ All categories and channels
- ✅ Role hierarchy
- ✅ Proper permissions
- ✅ Welcome message

## 🎮 What You Get

### Categories & Channels

- **🌀 GameDin Core**: Welcome, rules, announcements
- **💬 Unity Circle**: Gaming chat, memes, community
- **🎮 Game Rooms**: Game-specific channels
- **🎥 Spotlight**: Content sharing
- **🔊 GameDin Voice**: Voice channels
- **🛡️ Moderation**: Staff channels

### Roles

- 👑 Sovereign (Owner)
- 🛡️ Guardian (Senior Mod)
- ✨ Seraph (Moderator)
- 🌟 Trial Seraph (Trial Mod)
- 💫 Member (Regular)

### Features

- ✅ Auto-moderation
- ✅ XP system
- ✅ Welcome messages
- ✅ Role management
- ✅ Moderation tools

## 🔧 Troubleshooting

### Bot Not Responding?

- Check if token is correct in `.env`
- Verify bot is online
- Check bot permissions

### Commands Not Working?

- Run `npm run deploy-commands` again
- Check bot has proper permissions
- Restart the bot

### Need Help?

- See `DISCORD_SERVER_SETUP.md` for detailed instructions
- Check bot logs for errors
- Verify all environment variables

## 🎉 Success!

Once setup is complete, you'll have a fully functional gaming community with:

- Automated server management
- Comprehensive moderation tools
- XP and leveling system
- Professional channel structure
- Community engagement features

**🎮 Welcome to GameDin - Where Gaming Meets Community! 🎮**
