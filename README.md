# 🌟 GameDin Discord Bot - Automated Server Management

A comprehensive Discord bot designed to automatically manage and maintain the GameDin Discord server at [https://discord.gg/snwv9dbq](https://discord.gg/snwv9dbq). This bot provides complete server automation, moderation, and community management features with enhanced TypeScript architecture, comprehensive error handling, and extensive testing.

## 🚀 Features

### 🏗️ **Enhanced Architecture**
- **TypeScript-First**: Built with strict TypeScript for type safety and better developer experience
- **Modular Design**: Clean separation of concerns with service-based architecture
- **Error Handling**: Comprehensive error handling with custom error types and recovery mechanisms
- **Validation System**: Input validation and sanitization for all user interactions
- **Configuration Management**: Environment-based configuration with validation

### 🛡️ **Advanced Auto-Moderation**
- **Spam Detection**: Intelligent spam filtering with configurable thresholds
- **Content Filtering**: AI-powered content moderation and inappropriate language detection
- **Excessive Caps Detection**: Prevents message spam with all caps
- **Link Spam Protection**: Limits multiple links in single messages
- **Auto-Mute System**: Automatic temporary mutes for repeated violations
- **Warning System**: Progressive warning system with wisdom quotes
- **Audit Logging**: Comprehensive logging of all moderation actions

### 🎮 **XP & Leveling System**
- **Message XP**: Users gain XP for active participation
- **Voice XP**: XP rewards for time spent in voice channels
- **Level Progression**: Automatic level-ups with role rewards
- **Leaderboards**: Track top community members
- **Role Rewards**: Automatic role assignment based on levels
- **Achievement System**: Unlockable achievements and badges

### 👥 **Community Features**
- **Welcome System**: Personalized welcome messages for new members
- **Role Selection**: Reaction-based role assignment with visual interface
- **Moderation Tools**: Comprehensive moderation commands with validation
- **Trial Moderator System**: Aletheia-inspired trial moderator management
- **Activity Tracking**: Monitor user engagement and participation
- **Analytics Dashboard**: Server statistics and insights

### 🧪 **Testing & Quality**
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Test Coverage**: 80%+ test coverage with detailed reporting
- **Mock System**: Extensive mocking for Discord.js and external services
- **CI/CD Ready**: GitHub Actions integration for automated testing
- **Code Quality**: ESLint and Prettier for consistent code style

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
- `/manage status` - Check server status and health
- `/manage fix` - Fix missing channels/roles
- `/manage config` - View and update server configuration

### Moderation Commands
- `/trial add <user>` - Add trial moderator with validation
- `/trial promote <user>` - Promote trial moderator
- `/trial remove <user>` - Remove trial moderator
- `/warn <user> <reason> <guidance>` - Issue warning with wisdom
- `/evaluate <user>` - Evaluate trial moderator performance
- `/history <user>` - View comprehensive moderation history

### Community Commands
- `/bless <user>` - Bless a community member
- `/vibe` - Check server vibe and statistics
- `/match` - Find gaming partners with smart matching
- `/bloom` - Community growth features and analytics

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Discord Bot Token
- Discord Application with proper permissions
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/NovaSanctum/GameDinDiscord.git
cd GameDinDiscord
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Required Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# Optional Configuration
NODE_ENV=development
LOG_LEVEL=info
DEBUG=false
MAX_CONCURRENCY=10
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Database (Optional)
DATABASE_URL=mongodb://localhost:27017/gamedin
REDIS_URL=redis://localhost:6379

# AI Features (Optional)
OPENAI_API_KEY=your_openai_api_key_here
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
# Development mode
npm run dev

# Production mode
npm start
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The project maintains 80%+ test coverage across all modules:
- Unit tests for all services and utilities
- Integration tests for command execution
- Mock tests for Discord.js interactions
- Error handling and edge case testing

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Manual Docker Build
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Stop container
npm run docker:stop
```

## 🔧 Configuration

### Server Configuration
Edit `src/config/serverConfig.ts` to customize:
- Channel structure and permissions
- Role hierarchy and permissions
- Auto-moderation settings
- XP system parameters
- Welcome messages and templates

### Environment-Specific Settings
The bot automatically adjusts settings based on environment:
- **Development**: Debug mode, verbose logging, relaxed rate limits
- **Production**: Optimized performance, minimal logging, strict rate limits
- **Testing**: Mock services, fast execution, isolated environment

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

### Logging System
The bot includes comprehensive structured logging:
- **Error Logging**: Detailed error tracking with context
- **Performance Monitoring**: Response times and resource usage
- **Audit Logging**: All moderation actions and administrative changes
- **Debug Logging**: Detailed debugging information in development

### Health Monitoring
- Service health checks
- Database connection monitoring
- Discord API rate limit tracking
- Memory and performance metrics

### Log Levels
- `error` - Critical errors and failures
- `warn` - Warning conditions
- `info` - General information
- `debug` - Detailed debugging information

## 🔒 Security Features

### Input Validation
- All user input is validated and sanitized
- SQL injection prevention
- XSS protection
- Rate limiting on all commands

### Permission System
- Role-based access control
- Command permission validation
- Administrative action logging
- Secure token management

### Error Handling
- Graceful error recovery
- User-friendly error messages
- Detailed error logging for debugging
- Fallback mechanisms for critical failures

## 🚀 Performance Optimizations

### Caching
- Redis caching for frequently accessed data
- In-memory caching for session data
- Database query optimization

### Rate Limiting
- Intelligent rate limiting per user
- Command cooldown system
- API rate limit respect

### Resource Management
- Connection pooling for databases
- Memory leak prevention
- Efficient event handling

## 📚 Documentation

### Code Documentation
- Comprehensive JSDoc comments
- TypeScript type definitions
- Inline code documentation
- Architecture diagrams

### API Documentation
- Command reference
- Service interfaces
- Configuration options
- Error codes and messages

### Deployment Guides
- Local development setup
- Production deployment
- Docker containerization
- AWS deployment

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Maintain 80%+ test coverage
- Use ESLint and Prettier
- Write comprehensive documentation

### Testing Requirements
- Unit tests for all new features
- Integration tests for commands
- Error handling tests
- Performance tests for critical paths

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord.js Team** - For the excellent Discord API library
- **TypeScript Team** - For the amazing type system
- **Jest Team** - For the comprehensive testing framework
- **NovaSanctum Community** - For inspiration and feedback

## 📞 Support

- **Discord Server**: [GameDin Discord](https://discord.gg/snwv9dbq)
- **GitHub Issues**: [Report Bugs](https://github.com/NovaSanctum/GameDinDiscord/issues)
- **Documentation**: [Wiki](https://github.com/NovaSanctum/GameDinDiscord/wiki)

---

**Made with ❤️ by NovaSanctum for the GameDin Community** 