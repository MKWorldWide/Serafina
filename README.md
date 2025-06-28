# 🌟 GameDin Discord Bot - Automated Server Management

A comprehensive Discord bot designed to automatically manage and maintain the GameDin Discord server at [https://discord.gg/snwv9dbq](https://discord.gg/snwv9dbq). This bot provides complete server automation, moderation, and community management features.

## 🚀 Features

### 🏗️ **Automated Server Management**
- **Automatic Setup**: Creates all necessary channels, categories, and roles on startup
- **Server Structure**: Pre-configured with GameDin's specific layout
- **Role Management**: Automated role assignment and permission management
- **Channel Organization**: 6 categories with 25+ channels automatically created

### 🛡️ **Advanced Auto-Moderation**
- **Spam Detection**: Automatic spam filtering with configurable thresholds
- **Toxic Content Filter**: Filters inappropriate language and content
- **Excessive Caps Detection**: Prevents message spam with all caps
- **Link Spam Protection**: Limits multiple links in single messages
- **Auto-Mute System**: Automatic temporary mutes for repeated violations
- **Warning System**: Progressive warning system with wisdom quotes

### 🎮 **XP & Leveling System**
- **Message XP**: Users gain XP for active participation
- **Voice XP**: XP rewards for time spent in voice channels
- **Level Progression**: Automatic level-ups with role rewards
- **Leaderboards**: Track top community members
- **Role Rewards**: Automatic role assignment based on levels

### 👥 **Community Features**
- **Welcome System**: Personalized welcome messages for new members
- **Role Selection**: Reaction-based role assignment
- **Moderation Tools**: Comprehensive moderation commands
- **Trial Moderator System**: Aletheia-inspired trial moderator management
- **Activity Tracking**: Monitor user engagement and participation

## 📁 Server Structure

### 🌀 GameDin Core
- `#welcome` - Welcome messages and server information
- `#rules-and-purpose` - Community guidelines and purpose
- `#introduce-yourself` - New member introductions
- `#announcements` - Important server announcements
- `#role-select` - Role selection with reactions

### 💬 Unity Circle
- `#gaming-chat` - General gaming discussions
- `#memes-and-chaos` - Memes and fun content
- `#vent-channel` - Venting and support
- `#coven-circle` - Community discussions
- `#after-dark` - Mature content discussions
- `#holy-quotes` - Inspirational quotes

### 🎮 Game Rooms
- `#matchmaking` - Find gaming partners
- `#roblox-din` - Roblox discussions
- `#fortnite-legion` - Fortnite community
- `#fighting-games` - Fighting game discussions
- `#suggest-a-game` - Game suggestions

### 🎥 Spotlight
- `#your-streams` - Share your streams
- `#epic-moments` - Gaming highlights
- `#art-and-mods` - Art and modifications

### 🔊 GameDin Voice
- `🎤 General Vibe` - Main voice channel
- `🎮 Game Night VC` - Gaming voice channel
- `🕊️ Chill Lounge` - Relaxed voice channel
- `🔒 The Throne Room` - Private voice channel
- `🔥 Sacred Flame VC` - Active gaming voice

### 🛡️ Moderation
- `#mod-logs` - Moderation action logs
- `#mod-chat` - Moderator discussions
- `#reports` - User reports
- `#trial-moderators` - Trial moderator management

## 👑 Role Hierarchy

1. **👑 Sovereign** - Server Owner (Administrator)
2. **🛡️ Guardian** - Senior Moderator
3. **✨ Seraph** - Moderator
4. **🌟 Trial Seraph** - Trial Moderator
5. **💫 Member** - Regular Member
6. **🎮 Gamer** - Active Gamer (Level 5+)
7. **🎨 Creator** - Content Creator (Level 10+)
8. **🌟 Veteran** - Long-term Member (Level 25+)
9. **💎 Elite** - Elite Member (Level 50+)
10. **👑 Legend** - Legendary Member (Level 100+)

## 🛠️ Commands

### Administrator Commands
- `/manage setup` - Initialize server structure
- `/manage status` - Check server status
- `/manage fix` - Fix missing channels/roles

### Moderation Commands
- `/trial add <user>` - Add trial moderator
- `/trial promote <user>` - Promote trial moderator
- `/trial remove <user>` - Remove trial moderator
- `/warn <user> <reason> <guidance>` - Issue warning with wisdom
- `/evaluate <user>` - Evaluate trial moderator
- `/history <user>` - View moderation history

### Community Commands
- `/bless <user>` - Bless a community member
- `/vibe` - Check server vibe
- `/match` - Find gaming partners
- `/bloom` - Community growth features

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Discord Bot Token
- Discord Application with proper permissions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GameDinDiscord
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file:
```env
DISCORD_TOKEN=your_discord_bot_token_here
```

### 4. Build the Project
```bash
npm run build
```

### 5. Deploy Commands
```bash
npm run deploy-commands
```

### 6. Start the Bot
```bash
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Manual Docker Build
```bash
docker build -t gamedin-bot .
docker run -d --name gamedin-bot gamedin-bot
```

## 🔧 Configuration

### Server Configuration
Edit `src/config/serverConfig.ts` to customize:
- Channel structure
- Role permissions
- Auto-moderation settings
- XP system parameters
- Welcome messages

### Auto-Moderation Settings
```typescript
autoMod: {
  spamThreshold: 5,        // Messages per window
  spamWindow: 5000,        // Time window in ms
  toxicWords: [...],       // Filtered words
  welcomeMessages: [...]   // Welcome message templates
}
```

### XP System Settings
```typescript
xp: {
  messageXp: 1,            // XP per message
  voiceXpPerMinute: 2,     // XP per minute in voice
  levelMultiplier: 100     // XP needed per level
}
```

## 📊 Monitoring & Logs

The bot includes comprehensive logging:
- Server initialization events
- Moderation actions
- XP and leveling events
- Error tracking and debugging

Logs are available in the console and can be configured for external logging services.

## 🔒 Security Features

- **Permission-based Commands**: All commands require appropriate permissions
- **Rate Limiting**: Built-in cooldowns to prevent abuse
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling and recovery
- **Audit Logging**: All actions are logged for accountability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Support

For support and questions:
- Join our Discord: [https://discord.gg/snwv9dbq](https://discord.gg/snwv9dbq)
- Create an issue on GitHub
- Contact the development team

---

**GameDin Bot** - Building a sacred gaming community through automation and unity. 🌟 