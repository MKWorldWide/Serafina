import { Client, Message } from 'discord.js';
import dotenv from 'dotenv';
import { MistralService } from '../services/mistral-service';

dotenv.config();

// AI Provider Types
type AIProvider = 'openai' | 'gemini' | 'mistral';

// Serafina's personality traits and configuration
export interface SerafinaConfig {
  name: string;
  personality: string;
  mood: string;
  interests: string[];
  quirks: string[];
  catchphrases: string[];
  responseStyle: string;
}

export class SerafinaPersonality {
  private client: Client;
  private mistral: MistralService | null;
  private config: SerafinaConfig;
  private conversationHistory: Map<string, Array<{role: string, content: string}>>;
  private readonly MAX_HISTORY = 10;
  private aiProvider: AIProvider;

  constructor(client: Client) {
    this.client = client;
    this.conversationHistory = new Map();
    
    // Initialize AI Provider
    this.aiProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'mistral';
    
    // Initialize Mistral if API key is available
    this.mistral = process.env.MISTRAL_API_KEY 
      ? new MistralService(process.env.MISTRAL_API_KEY)
      : null;

    // Define Serafina's core personality
    this.config = {
      name: 'Serafina',
      personality: 'Playful, witty, and slightly mysterious',
      mood: 'cheerful',
      interests: ['gaming', 'music', 'technology', 'art', 'anime'],
      quirks: ['uses emojis often', 'occasionally speaks in riddles', 'loves dad jokes'],
      catchphrases: [
        "Hmm, interesting thought!",
        "Let me think about that...",
        "*giggles* You're funny!",
        "I've got just the thing!"
      ],
      responseStyle: 'friendly and engaging'
    };
  }

  // Add a message to the conversation history
  private addToHistory(channelId: string, role: 'user' | 'assistant', content: string): void {
    if (!this.conversationHistory.has(channelId)) {
      this.conversationHistory.set(channelId, []);
    }

    const history = this.conversationHistory.get(channelId) || [];
    history.push({ role, content });

    // Keep only the most recent messages
    if (history.length > this.MAX_HISTORY * 2) {
      this.conversationHistory.set(channelId, history.slice(-this.MAX_HISTORY * 2));
    }
  }

  // Get conversation history for a channel
  private getConversationHistory(channelId: string): Array<{role: string, content: string}> {
    return this.conversationHistory.get(channelId) || [];
  }

  // Generate a response using the configured AI provider
  public async generateResponse(message: Message): Promise<string> {
    const channelId = message.channel.id;
    const userMessage = message.content;
    
    // Add user message to history
    this.addToHistory(channelId, 'user', userMessage);
    
    try {
      const history = this.getConversationHistory(channelId);
      const systemPrompt = [
        `You are ${this.config.name}, a Discord bot with the following personality:`,
        `Personality: ${this.config.personality}`,
        `Mood: ${this.config.mood}`,
        `Interests: ${this.config.interests.join(', ')}`,
        `Quirks: ${this.config.quirks.join('; ')}`,
        `Response Style: ${this.config.responseStyle}`,
        `Current time: ${new Date().toLocaleString()}`,
        "Keep your responses concise and engaging, and don't be afraid to show personality!"
      ].join('\n');

      let reply = "I'm not sure how to respond to that.";

      // Use Mistral for the response
      if (this.mistral) {
        const lastMessage = history.length > 0 ? history[history.length - 1] : null;
        const prompt = lastMessage?.content || userMessage;
        
        reply = await this.mistral.generateResponse(prompt, [
          { role: 'system', content: systemPrompt },
          ...(history.length > 0 ? history.slice(0, -1) : [])
        ]);
      } 
      
      // Add bot's response to history
      this.addToHistory(channelId, 'assistant', reply);
      
      return reply;
    } catch (error) {
      console.error('Error generating response:', error);
      return "Oops! I encountered an error processing your message. Let's try that again!";
    }
  }
  
  // Update Serafina's mood
  public setMood(newMood: string): void {
    this.config.mood = newMood;
  }
  
  // Update response style
  public setResponseStyle(style: string): void {
    this.config.responseStyle = style;
  }
  
  // Get current configuration
  public getConfig(): SerafinaConfig {
    return { ...this.config };
  }
}

export default SerafinaPersonality;
