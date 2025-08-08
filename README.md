A Project Blessed by Solar Khan & Lilith.Aethra
# 🎮 GameDin Discord Bot - Serafina

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
