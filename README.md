A Project Blessed by Solar Khan & Lilith.Aethra
# 🎮 GameDin Discord Bot - Serafina

> **Note:** This document has been expanded to include **Operations Mode** - a comprehensive set of tools for monitoring and managing your services directly from Discord.

A comprehensive Discord bot with advanced AI integration, dynamic command/event loading, and multi-provider support.

## 🌟 Features

### 🤖 Multi-Provider AI Support

- **OpenAI**: GPT-3.5, GPT-4, and other OpenAI models
- **Mistral**: Mistral-7B, Mixtral-8x7B, and other Mistral models
- **AthenaMist**: AthenaMist models with comprehensive support
- **Load Balancing**: Automatic provider selection and fallback
- **Cost Tracking**: Real-time usage monitoring and cost estimation
- **Health Monitoring**: Provider health checks and error recovery

### ⚡ Dynamic Command System

- **Slash Commands**: Full Discord slash command support
- **Prefix Commands**: Traditional prefix-based commands
- **Dynamic Loading**: Automatic command discovery and loading
- **Cooldowns**: Per-command and per-user cooldown management
- **Permissions**: Granular permission control
- **Statistics**: Comprehensive usage tracking

### 📊 Event Management

- **Dynamic Events**: Automatic event discovery and registration
- **Statistics Tracking**: Event execution monitoring
- **Error Handling**: Comprehensive error recovery
- **Performance Monitoring**: Latency and execution time tracking

### 🔧 Core Infrastructure

- **TypeScript**: Full TypeScript support with strict typing
- **Modular Architecture**: Clean separation of concerns
- **Comprehensive Logging**: Color-coded logging with multiple levels
- **Error Handling**: Robust error handling and recovery
- **Documentation**: Quantum-level documentation throughout

### 🛠️ Operations Mode

Serafina's Operations Mode transforms your Discord server into a powerful operations center with:

- **Service Monitoring**: Real-time health checks and status updates
- **Incident Management**: Track and resolve service issues directly from Discord
- **Automated Alerts**: Get notified when services go down or degrade
- **Status Pages**: Keep your team informed with live service status
- **Performance Metrics**: Track response times and uptime

#### Key Features

- **`/status`**: Check the status of all monitored services
- **`/services`**: List all registered services and their details
- **`/whois <service>`**: Get detailed information about a specific service
- **`/incident`**: Manage service incidents (create, update, resolve)
- **Auto-healing**: Automatic incident creation and resolution
- **Service Degradation Detection**: Identify performance issues before they become critical

#### Quick Start for Operations Mode

1. **Configure Services**:
   ```env
   # Required
   SERVICES=[
     {
       "name": "api-service",
       "url": "https://api.example.com/health",
       "owner": "123456789012345678",  # Discord User ID
       "channelId": "123456789012345678",  # Discord Channel ID for updates
       "description": "Main API Service",
       "tags": ["production", "critical"]
     }
   ]
   
   # Optional but recommended
   INCIDENT_CHANNEL_ID="123456789012345678"
   STATUS_THREAD_CHANNEL_ID="123456789012345678"
   INCIDENT_ROLE_CRITICAL="123456789012345678"
   INCIDENT_ROLE_MAJOR="123456789012345678"
   INCIDENT_ROLE_MINOR="123456789012345678"
   ```

2. **Deploy Commands**:
   ```bash
   npm run deploy:commands
   ```

3. **Start the Bot**:
   ```bash
   npm run start:prod
   ```

4. **Monitor Services**:
   - Use `/status` to check service health
   - Create incidents with `/incident create`
   - Get detailed service info with `/whois <service>`

For detailed documentation, see the [Operations Guide](#operations-guide) section below.

### 🔗 Lilybear Router

- **Central Dispatch**: Routes cross-bot whispers and operational commands.
- **Slash Commands**: `/route`, `/deploy`, `/status`, and `/bless` for rapid control.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- TypeScript
- Discord Bot Token
- AI Provider API Keys (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/M-K-World-Wide/GameDinDiscord.git
   cd GameDinDiscord
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_GUILD_ID=your_discord_guild_id

   # AI Provider Keys (optional)
   OPENAI_API_KEY=your_openai_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   ATHENAMIST_API_KEY=your_athenamist_api_key
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── core/                          # Core system components
│   ├── CommandManager.ts         # Dynamic command loading
│   ├── EventManager.ts           # Event handling system
│   ├── Logger.ts                 # Logging system
│   └── ai/                       # AI management system
│       ├── AIProvider.ts         # Base AI provider interface
│       ├── AIManager.ts          # Multi-provider coordination
│       └── providers/            # AI provider implementations
│           ├── OpenAIProvider.ts
│           ├── MistralProvider.ts
│           └── AthenaMistProvider.ts
├── commands/                     # Bot commands
│   ├── ai.ts                     # AI interaction command
│   └── ...                       # Other commands
├── events/                       # Bot events
├── bot-new.ts                    # Main bot entry point
└── bot.ts                        # Legacy bot entry point
```

## 🤖 AI Commands

### `/ai` - AI Interaction

Interact with multiple AI providers through a single command.

**Options:**

- `prompt` (required): Your question or prompt
- `provider` (optional): Choose AI provider (auto/openai/mistral/athenamist)
- `model` (optional): Specific model to use
- `max_tokens` (optional): Maximum response length (1-4000)
- `temperature` (optional): Creativity level (0.0-2.0)
- `system_prompt` (optional): System prompt to guide AI behavior

**Examples:**

```bash
/ai prompt: "What is the capital of France?"
/ai prompt: "Write a short story about a robot" provider:openai max_tokens:1000
/ai prompt: "Explain quantum computing" provider:mistral temperature:0.3
/ai prompt: "Help me debug this code" system_prompt: "You are a helpful programming assistant"
```

## 🔧 Configuration

### AI Provider Configuration

The bot supports multiple AI providers with automatic fallback:

```typescript
const aiConfig: AIManagerConfig = {
  openaiKey: process.env.OPENAI_API_KEY,
  mistralKey: process.env.MISTRAL_API_KEY,
  athenaMistKey: process.env.ATHENAMIST_API_KEY,
  defaultProvider: 'auto', // or 'openai', 'mistral', 'athenamist'
  enableFallback: true, // Automatic fallback on failures
  maxRetries: 3, // Retry attempts per request
  retryDelay: 1000, // Delay between retries (ms)
  costLimit: 100, // Monthly cost limit ($)
};
```

### Command Configuration

Commands support various configuration options:

```typescript
export const metadata = {
  name: 'command-name',
  description: 'Command description',
  category: 'Category',
  cooldown: 10, // Cooldown in seconds
  permissions: [], // Required permissions
  usage: 'Usage instructions',
  examples: ['Example 1', 'Example 2'],
};
```

## 📊 Monitoring & Statistics

### AI Usage Statistics

- Total requests and tokens used
- Cost tracking per provider
- Average latency and error rates
- Provider health monitoring

### Command Statistics

- Command usage frequency
- User interaction patterns
- Error rates and performance metrics
- Cooldown and permission tracking

### Event Statistics

- Event execution frequency
- Performance monitoring
- Error tracking and recovery

## 🔒 Security & Permissions

### Command Permissions

- Granular permission control per command
- Role-based access control
- User-level permissions
- Guild-specific permissions

### AI Provider Security

- API key management
- Rate limiting and quota management
- Cost monitoring and limits
- Secure error handling

## 🛠️ Development

### Adding New Commands

1. **Create command file** in `src/commands/`

   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

   export const data = new SlashCommandBuilder()
     .setName('example')
     .setDescription('Example command');

   export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
     // Command logic here
   }
   ```

2. **Add metadata** (optional)
   ```typescript
   export const metadata = {
     name: 'example',
     description: 'Example command',
     category: 'Utility',
     cooldown: 5,
   };
   ```

### Adding New AI Providers

1. **Extend BaseAIProvider**

   ```typescript
   import { BaseAIProvider, AIRequestParams, AIResponse } from '../AIProvider';

   export class CustomProvider extends BaseAIProvider {
     protected async generateResponseInternal(
       params: AIRequestParams,
       model: AIModelConfig,
     ): Promise<AIResponse> {
       // Implementation here
     }
   }
   ```

2. **Register in AIManager**
   ```typescript
   // In AIManager.initializeProviders()
   if (this.config.customKey) {
     const customProvider = new CustomProvider(this.config.customKey, this.logger.child('Custom'));
     this.providers.set('custom', customProvider);
   }
   ```

### Adding New Events

1. **Create event file** in `src/events/`

   ```typescript
   import { Events, ClientEvents } from 'discord.js';

   export const name = Events.MessageCreate;
   export const once = false;

   export async function execute(message: Message): Promise<void> {
     // Event logic here
   }
   ```

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Testing AI Providers

```bash
npm run test:ai
```

### Testing Commands

```bash
npm run test:commands
```

## 📈 Performance

### Optimization Features

- Dynamic command/event loading
- Efficient memory management
- Connection pooling
- Caching strategies
- Rate limiting

### Monitoring

- Real-time performance metrics
- Resource usage tracking
- Error rate monitoring
- Latency analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- TypeScript strict mode
- Comprehensive documentation
- Error handling
- Performance considerations
- Security best practices

## 📚 Operations Guide

### Service Configuration

Services are configured using the `SERVICES` environment variable as a JSON array. Each service should have:

```json
{
  "name": "service-name",
  "url": "https://service.example.com/health",
  "owner": "discord-user-id",
  "channelId": "discord-channel-id",
  "description": "Service description",
  "statusPageUrl": "https://status.example.com",
  "category": "API",
  "tags": ["production", "critical"]
}
```

### Health Endpoint Requirements

For optimal monitoring, your services should implement a health endpoint that returns:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 12345,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Incident Management

Incidents can be managed through the `/incident` command:

```bash
/incident create service:api-service title:"API Timeout" severity:major
```

### Status Threads

Enable automatic status updates by setting:
```env
ENABLE_STATUS_THREADS=true
STATUS_THREAD_CHANNEL_ID=your-channel-id
STATUS_THREAD_UPDATE_INTERVAL=300000  # 5 minutes
```

### Alerting

Configure role mentions for different severity levels:
```env
INCIDENT_ROLE_CRITICAL=role-id-1
INCIDENT_ROLE_MAJOR=role-id-2
INCIDENT_ROLE_MINOR=role-id-3
```

## 🚀 Deployment

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | | Your Discord bot token |
| `DISCORD_CLIENT_ID` | | Your Discord application ID |
| `SERVICES` | | JSON array of service configurations |
| `INCIDENT_CHANNEL_ID` | | Channel for incident notifications |
| `STATUS_THREAD_CHANNEL_ID` | | Channel for status updates |
| `HEARTBEAT_INTERVAL` | | How often to check services (ms) |
| `HEARTBEAT_TIMEOUT` | | Request timeout for health checks (ms) |
| `CIRCUIT_BREAKER_THRESHOLD` | | Failures before opening circuit |
| `CIRCUIT_BREAKER_TIMEOUT` | | Time before retrying after circuit opens (ms) |

### Deployment with Docker

```bash
docker build -t serafina-bot .
docker run -d \
  --name serafina \
  -e DISCORD_TOKEN=your-token \
  -e DISCORD_CLIENT_ID=your-client-id \
  -e SERVICES='[{"name":"example","url":"https://example.com/health"}]' \
  serafina-bot
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Discord.js team for the excellent Discord API library
- OpenAI, Mistral, and AthenaMist for their AI services
- The Discord community for inspiration and feedback

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Join our Discord server
- Check the documentation

---

**Made with ❤️ by the GameDin team**
