/**
 * 🎮 GameDin Discord Bot - AI Command
 *
 * Enhanced AI command that supports multiple AI providers (OpenAI, Mistral, AthenaMist)
 * with comprehensive features including provider selection, model configuration,
 * cost tracking, and usage statistics.
 *
 * Features:
 * - Multi-provider AI support (OpenAI, Mistral, AthenaMist)
 * - Provider selection and model configuration
 * - Cost estimation and usage tracking
 * - System prompts and context support
 * - Rate limiting and error handling
 * - Quantum documentation and usage tracking
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { AIManager, AIManagerConfig } from '../core/ai/AIManager';
import { AIRequestParams, AIErrorType, AIProviderError } from '../core/ai/AIProvider';
import { Logger } from '../core/Logger';

/**
 * AI command data
 */
export const data = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Interact with AI models (OpenAI, Mistral, AthenaMist)')
  .addStringOption(option =>
    option
      .setName('prompt')
      .setDescription('Your question or prompt for the AI')
      .setRequired(true)
      .setMaxLength(2000),
  )
  .addStringOption(option =>
    option
      .setName('provider')
      .setDescription('Choose AI provider')
      .setRequired(false)
      .addChoices(
        { name: 'Auto (Best Available)', value: 'auto' },
        { name: 'OpenAI', value: 'openai' },
        { name: 'Mistral', value: 'mistral' },
        { name: 'AthenaMist', value: 'athenamist' },
      ),
  )
  .addStringOption(option =>
    option.setName('model').setDescription('Specific model to use').setRequired(false),
  )
  .addIntegerOption(option =>
    option
      .setName('max_tokens')
      .setDescription('Maximum tokens in response (default: 500)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(4000),
  )
  .addNumberOption(option =>
    option
      .setName('temperature')
      .setDescription('Creativity level (0.0-2.0, default: 0.7)')
      .setRequired(false)
      .setMinValue(0.0)
      .setMaxValue(2.0),
  )
  .addStringOption(option =>
    option
      .setName('system_prompt')
      .setDescription('System prompt to guide AI behavior')
      .setRequired(false)
      .setMaxLength(1000),
  );

/**
 * AI command execution
 */
export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const logger = new Logger('AICommand');

  try {
    // Defer reply for longer processing time
    await interaction.deferReply();

    // Get command options
    const prompt = interaction.options.getString('prompt', true);
    const provider = interaction.options.getString('provider') || 'auto';
    const model = interaction.options.getString('model');
    const maxTokens = interaction.options.getInteger('max_tokens') || 500;
    const temperature = interaction.options.getNumber('temperature') || 0.7;
    const systemPrompt = interaction.options.getString('system_prompt');

    logger.info(`AI request from ${interaction.user.tag}: ${prompt.substring(0, 50)}...`);

    // Initialize AI manager with environment variables
    const aiConfig: AIManagerConfig = {
      openaiKey: process.env.OPENAI_API_KEY,
      mistralKey: process.env.MISTRAL_API_KEY,
      athenaMistKey: process.env.ATHENAMIST_API_KEY,
      defaultProvider: provider === 'auto' ? undefined : provider,
      enableFallback: true,
      maxRetries: 3,
      retryDelay: 1000,
      costLimit: 100,
    };

    const aiManager = new AIManager(aiConfig, logger.child('AIManager'));

    // Check if any providers are available
    const availableProviders = aiManager.getAvailableProviders();
    if (availableProviders.length === 0) {
      await interaction.editReply({
        content:
          '❌ No AI providers are currently available. Please check your API keys and try again.',
        embeds: [
          createErrorEmbed(
            'No AI Providers Available',
            'All configured AI providers are unavailable or have invalid API keys.',
          ),
        ],
      });
      return;
    }

    // Prepare AI request parameters
    const aiParams: AIRequestParams = {
      prompt,
      provider: provider === 'auto' ? undefined : provider,
      model: model || undefined,
      maxTokens,
      temperature,
      systemPrompt: systemPrompt || undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId || undefined,
    };

    // Generate AI response
    const response = await aiManager.generateResponse(aiParams);

    // Create response embed
    const embed = createResponseEmbed(response, aiParams);

    // Create action buttons
    const actionRow = createActionRow(response, aiParams);

    // Send response
    await interaction.editReply({
      content: `🤖 **AI Response** (${response.model})`,
      embeds: [embed],
      components: [actionRow],
    });

    logger.info(
      `AI response generated successfully using ${response.model}, cost: $${response.cost.toFixed(4)}`,
    );
  } catch (error) {
    logger.error('Error executing AI command:', error);

    let errorMessage = '❌ An error occurred while processing your AI request.';
    let errorEmbed = createErrorEmbed('AI Error', 'An unexpected error occurred.');

    if (error instanceof AIProviderError) {
      switch (error.type) {
        case AIErrorType.AUTHENTICATION:
          errorMessage = '❌ AI provider authentication failed. Please check API keys.';
          errorEmbed = createErrorEmbed(
            'Authentication Error',
            'Invalid or missing API key for the selected AI provider.',
          );
          break;
        case AIErrorType.RATE_LIMIT:
          errorMessage = '⏰ Rate limit exceeded. Please wait a moment and try again.';
          errorEmbed = createErrorEmbed(
            'Rate Limit',
            'Too many requests. Please wait before trying again.',
          );
          break;
        case AIErrorType.QUOTA_EXCEEDED:
          errorMessage = '💰 AI usage quota exceeded. Please check your account limits.';
          errorEmbed = createErrorEmbed('Quota Exceeded', 'You have reached your AI usage limit.');
          break;
        case AIErrorType.MODEL_UNAVAILABLE:
          errorMessage = '🔧 The requested AI model is currently unavailable.';
          errorEmbed = createErrorEmbed(
            'Model Unavailable',
            'The selected AI model is not available at the moment.',
          );
          break;
        case AIErrorType.INVALID_REQUEST:
          errorMessage = '📝 Invalid request parameters. Please check your input.';
          errorEmbed = createErrorEmbed(
            'Invalid Request',
            'The request parameters are invalid or malformed.',
          );
          break;
        default:
          errorMessage = '❌ AI service error. Please try again later.';
          errorEmbed = createErrorEmbed('AI Service Error', 'The AI service encountered an error.');
      }
    }

    await interaction.editReply({
      content: errorMessage,
      embeds: [errorEmbed],
    });
  }
}

/**
 * Create response embed
 */
function createResponseEmbed(response: any, params: AIRequestParams): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('🤖 AI Response')
    .setDescription(response.content)
    .addFields(
      { name: 'Model', value: response.model, inline: true },
      { name: 'Tokens Used', value: response.tokensUsed.toString(), inline: true },
      { name: 'Cost', value: `$${response.cost.toFixed(4)}`, inline: true },
      { name: 'Latency', value: `${response.latency}ms`, inline: true },
      { name: 'Provider', value: response.model.split('-')[0] || 'Unknown', inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'GameDin AI System' });

  if (params.systemPrompt) {
    embed.addFields({
      name: 'System Prompt',
      value:
        params.systemPrompt.substring(0, 100) + (params.systemPrompt.length > 100 ? '...' : ''),
      inline: false,
    });
  }

  return embed;
}

/**
 * Create error embed
 */
function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'GameDin AI System' });
}

/**
 * Create action row with buttons
 */
function createActionRow(response: any, params: AIRequestParams): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ai_retry_${Date.now()}`)
      .setLabel('🔄 Retry')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`ai_stats_${Date.now()}`)
      .setLabel('📊 Stats')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ai_help_${Date.now()}`)
      .setLabel('❓ Help')
      .setStyle(ButtonStyle.Secondary),
  );
}

/**
 * Command metadata
 */
export const metadata = {
  name: 'ai',
  description: 'Interact with AI models (OpenAI, Mistral, AthenaMist)',
  category: 'AI',
  cooldown: 10,
  permissions: [],
  usage:
    '/ai prompt: "Your question here" [provider] [model] [max_tokens] [temperature] [system_prompt]',
  examples: [
    '/ai prompt: "What is the capital of France?"',
    '/ai prompt: "Write a short story about a robot" provider:openai max_tokens:1000',
    '/ai prompt: "Explain quantum computing" provider:mistral temperature:0.3',
    '/ai prompt: "Help me debug this code" system_prompt: "You are a helpful programming assistant"',
  ],
};
