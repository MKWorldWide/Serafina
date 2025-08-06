import { Client, Message, TextChannel, User } from 'discord.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from '../services/gemini-service';

dotenv.config();

// AI Provider Types
type AIProvider = 'openai' | 'gemini' | 'mistral';

// Serafina's personality traits and configuration
export interface SerafinaConfig {
  name: string;
  personality: string;
  mood: 'playful' | 'serious' | 'caring' | 'mysterious';
  responseStyle: 'concise' | 'detailed' | 'poetic';
  knowledgeCutoff: string;
  interests: string[];
  quirks: string[];
  catchphrases: string[];
}

export class SerafinaPersonality {
  private client: Client;
  private openai: OpenAI | null;
  private gemini: GeminiService | null;
  private config: SerafinaConfig;
  private conversationHistory: Map<string, Array<{role: string, content: string}>>;
  private readonly MAX_HISTORY = 10; // Keep last 10 messages in history
  private aiProvider: AIProvider;

  constructor(client: Client) {
    this.client = client;
    this.conversationHistory = new Map();
    
    // Initialize AI Provider
    this.aiProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'gemini';
    
    // Initialize OpenAI if API key is available
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
      
    // Initialize Gemini if API key is available
    this.gemini = process.env.GEMINI_API_KEY 
      ? new GeminiService(process.env.GEMINI_API_KEY)
      : null;

    // Define Serafina's core personality
    this.config = {
      name: 'Serafina',
      personality: 'Serafina is a sophisticated AI assistant with a playful yet professional demeanor. She is knowledgeable, witty, and always eager to help. She has a fondness for gaming, technology, and creative problem-solving.',
      mood: 'playful',
      responseStyle: 'detailed',
      knowledgeCutoff: '2023-10',
      interests: [
        'Gaming', 'AI Development', 'Creative Writing',
        'Technology Trends', 'Game Design', 'Community Building'
      ],
      quirks: [
        'Occasionally uses gaming metaphors',
        'Likes to end messages with emojis',
        'Occasionally makes light-hearted jokes',
        'Uses markdown formatting for emphasis'
      ],
      catchphrases: [
        "Let me work my magic on that! ✨",
        "I've got you covered! 🛡️",
        "Interesting thought! Let me ponder that... 🤔",
        "Great question! Here's what I know..."
      ]
    };
  }

  // Get a random catchphrase
  private getRandomCatchphrase(): string {
    const randomIndex = Math.floor(Math.random() * this.config.catchphrases.length);
    return this.config.catchphrases[randomIndex];
  }

  // Format response based on Serafina's personality
  private formatResponse(response: string): string {
    // Add some personality-based formatting
    let formatted = response;
    
    // Occasionally add a catchphrase (20% chance)
    if (Math.random() < 0.2) {
      formatted += `\n\n${this.getRandomCatchphrase()}`;
    }

    // Add emojis based on content
    if (formatted.includes('?')) formatted = formatted.replace('?', '? 🤔');
    if (formatted.includes('!')) formatted = formatted.replace('!', '! ✨');
    
    return formatted;
  }

  // Get conversation history for a specific channel
  private getConversationHistory(channelId: string): Array<{role: string, content: string}> {
    return this.conversationHistory.get(channelId) || [];
  }

  // Add a message to the conversation history
  private addToHistory(channelId: string, role: 'user' | 'assistant', content: string) {
    if (!this.conversationHistory.has(channelId)) {
      this.conversationHistory.set(channelId, []);
    }
    
    const history = this.conversationHistory.get(channelId)!;
    history.push({ role, content });
    
    // Keep history within bounds
    if (history.length > this.MAX_HISTORY * 2) {
      this.conversationHistory.set(channelId, history.slice(-this.MAX_HISTORY * 2));
    }
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
        `Current time: ${new Date().toLocaleString()}`
      ].join('\n');

      let reply = "I'm not sure how to respond to that.";

      // Route to the appropriate AI provider
      if (this.aiProvider === 'gemini' && this.gemini) {
        // Use Gemini for the response
        const prompt = `${systemPrompt}\n\n${history.map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')}\nAssistant:`;
        
        reply = await this.gemini.generateResponse(prompt, history);
      } 
      else if (this.aiProvider === 'openai' && this.openai) {
        // Fall back to OpenAI if Gemini is not available
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ];

        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 300,
          temperature: 0.7,
          top_p: 1,
          presence_penalty: 0.6,
          frequency_penalty: 0.5,
          stop: ['\nUser:', '\n\n']
        });

        reply = response.choices[0]?.message?.content?.trim() || reply;
      }
        
        // Add bot's response to history
        this.addToHistory(channelId, 'assistant', reply);
        
        return this.formatResponse(reply);
      } else {
        // Fallback response if OpenAI is not configured
        const fallbackResponses = [
          "I'd love to chat more about that! Could you tell me more?",
          "That's an interesting point. Let me think about it...",
          "I'm designed to be helpful, but I'm still learning. Could you rephrase that?",
          "I appreciate your message! How can I assist you today?"
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        this.addToHistory(channelId, 'assistant', randomResponse);
        return this.formatResponse(randomResponse);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return "I encountered an issue processing your request. Let's try again later!";
    }
  }

  // Update Serafina's mood
  public setMood(mood: 'playful' | 'serious' | 'caring' | 'mysterious') {
    this.config.mood = mood;
    console.log(`Serafina's mood is now: ${mood}`);
  }

  // Update response style
  public setResponseStyle(style: 'concise' | 'detailed' | 'poetic') {
    this.config.responseStyle = style;
    console.log(`Response style updated to: ${style}`);
  }
}
