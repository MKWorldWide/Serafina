# 🎮 GameDin Discord Server Setup Guide

## 📋 Prerequisites

Before setting up your Discord server, you'll need:

1. **Discord Account**: A Discord account with permission to create servers
2. **Discord Bot Token**: Your GameDin bot's token from Discord Developer Portal
3. **Bot Permissions**: Proper permissions for the bot to manage the server

## 🚀 Step 1: Create Discord Server

### 1.1 Create New Server

1. Open Discord and click the "+" button to create a new server
2. Choose "Create My Own"
3. Select "For a gaming community"
4. Name your server: **"GameDin - Sacred Gaming Community"**
5. Upload a server icon (optional but recommended)
6. Click "Create"

### 1.2 Configure Server Settings

1. Go to **Server Settings** → **Overview**
2. Set the following:
   - **Server Name**: GameDin - Sacred Gaming Community
   - **Server Description**: A divine gaming community where unity, laughter, and friendship thrive
   - **Verification Level**: Medium
   - **Content Filter**: Medium
   - **Default Notifications**: Mentions Only
   - **System Messages**: Enabled

## 🤖 Step 2: Set Up Bot

### 2.1 Get Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing GameDin app
3. Go to **Bot** section
4. Copy the bot token
5. Add the token to your `.env` file

### 2.2 Configure Bot Permissions

1. In the **Bot** section, enable these permissions:
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Manage Channels
   - ✅ Manage Roles
   - ✅ Kick Members
   - ✅ Ban Members
   - ✅ Read Message History
   - ✅ Use Slash Commands
   - ✅ Add Reactions
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Mention Everyone (for announcements)

### 2.3 Generate Invite Link

1. Go to **OAuth2** → **URL Generator**
2. Select scopes: `bot` and `applications.commands`
3. Select the permissions listed above
4. Copy the generated invite link
5. Use this link to invite your bot to the server

## 🏗️ Step 3: Server Structure Setup

### 3.1 Manual Channel Creation (Alternative to Bot Setup)

If you prefer to create channels manually before running the bot setup:

#### **🌀 GameDin Core Category**

- **welcome** (Text Channel)
- **rules-and-purpose** (Text Channel)
- **introduce-yourself** (Text Channel)
- **announcements** (Text Channel)
- **role-select** (Text Channel)

#### **💬 Unity Circle Category**

- **gaming-chat** (Text Channel)
- **memes-and-chaos** (Text Channel)
- **vent-channel** (Text Channel)
- **coven-circle** (Text Channel)
- **after-dark** (Text Channel)
- **holy-quotes** (Text Channel)

#### **🎮 Game Rooms Category**

- **matchmaking** (Text Channel)
- **roblox-din** (Text Channel)
- **fortnite-legion** (Text Channel)
- **fighting-games** (Text Channel)
- **suggest-a-game** (Text Channel)

#### **🎥 Spotlight Category**

- **your-streams** (Text Channel)
- **epic-moments** (Text Channel)
- **art-and-mods** (Text Channel)

#### **🔊 GameDin Voice Category**

- **🎤 General Vibe** (Voice Channel)
- **🎮 Game Night VC** (Voice Channel)
- **🕊️ Chill Lounge** (Voice Channel)
- **🔒 The Throne Room** (Voice Channel)
- **🔥 Sacred Flame VC** (Voice Channel)

#### **🛡️ Moderation Category**

- **mod-logs** (Text Channel)
- **mod-chat** (Text Channel)
- **reports** (Text Channel)
- **trial-moderators** (Text Channel)

### 3.2 Role Setup

Create these roles manually (or let the bot create them):

1. **👑 Sovereign** (Gold color) - Server Owner
2. **🛡️ Guardian** (Red color) - Senior Moderator
3. **✨ Seraph** (Hot Pink color) - Moderator
4. **🌟 Trial Seraph** (Purple color) - Trial Moderator
5. **💫 Member** (Green color) - Regular Member

## ⚙️ Step 4: Bot Deployment

### 4.1 Environment Setup

1. Copy `env.example` to `.env`
2. Fill in your bot token and server ID:
   ```bash
   DISCORD_TOKEN=your_actual_bot_token
   DISCORD_CLIENT_ID=your_bot_client_id
   DISCORD_GUILD_ID=your_server_id
   ```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Build the Bot

```bash
npm run build
```

### 4.4 Deploy Commands

```bash
npm run deploy-commands
```

### 4.5 Start the Bot

```bash
npm run dev
```

## 🎯 Step 5: Bot Setup Command

Once the bot is running:

1. In your Discord server, use the slash command: `/setup`
2. The bot will automatically:
   - Create all categories and channels
   - Set up role hierarchy
   - Configure permissions
   - Send welcome message

## 🔧 Step 6: Verification & Testing

### 6.1 Test Bot Commands

- `/setup` - Server initialization
- `/warn` - Test moderation
- `/xp` - Check XP system
- `/leaderboard` - View XP leaderboard
- `/moderate` - Test moderation tools

### 6.2 Test Features

- [ ] Welcome messages for new members
- [ ] XP system for messages
- [ ] Auto-moderation
- [ ] Role assignments
- [ ] Channel permissions

## 🎨 Step 7: Customization

### 7.1 Server Branding

1. **Server Icon**: Upload a custom GameDin logo
2. **Server Banner**: Add a gaming-themed banner
3. **Server Description**: Update with your community's mission
4. **Custom Emojis**: Add gaming and community emojis

### 7.2 Welcome Message

The bot will create a welcome message, but you can customize it in the `setup.ts` command file.

### 7.3 Rules and Guidelines

Create comprehensive rules in the `rules-and-purpose` channel.

## 🛡️ Step 8: Security & Moderation

### 8.1 Verification System

1. Set up verification requirements
2. Configure auto-moderation settings
3. Set up moderation logs

### 8.2 Permission Management

1. Review all role permissions
2. Ensure moderation channels are private
3. Set up proper hierarchy

## 📊 Step 9: Analytics & Monitoring

### 9.1 Bot Logs

Monitor the bot's logs for:

- Command usage
- Error messages
- User activity
- Moderation actions

### 9.2 Server Analytics

Track:

- Member growth
- Channel activity
- Role distribution
- Moderation actions

## 🚀 Step 10: Launch & Promotion

### 10.1 Community Guidelines

1. Establish clear community rules
2. Set up moderation procedures
3. Create member guidelines

### 10.2 Promotion Strategy

1. Share server invite links
2. Promote on gaming communities
3. Use social media platforms
4. Partner with other gaming servers

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Responding

- Check if bot token is correct
- Verify bot has proper permissions
- Ensure bot is online

#### Commands Not Working

- Run `/deploy-commands` again
- Check bot permissions
- Verify command files are loaded

#### Channel Creation Failed

- Check bot's Manage Channels permission
- Ensure server has space for new channels
- Verify bot's role hierarchy

#### Role Assignment Issues

- Check bot's Manage Roles permission
- Ensure bot's role is above target roles
- Verify role hierarchy

## 📞 Support

If you encounter issues:

1. Check the bot logs
2. Review Discord Developer Portal settings
3. Verify environment variables
4. Test commands in a private channel

## 🎉 Success Checklist

- [ ] Discord server created
- [ ] Bot invited and online
- [ ] All channels created
- [ ] Roles set up properly
- [ ] Bot commands working
- [ ] Moderation system active
- [ ] Welcome system operational
- [ ] XP system tracking
- [ ] Server rules established
- [ ] Community guidelines posted

---

**🎮 Welcome to GameDin - Where Gaming Meets Community! 🎮**
