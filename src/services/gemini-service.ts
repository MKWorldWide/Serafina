import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly DEFAULT_MODEL = 'gemini-1.5-pro';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.DEFAULT_MODEL });
  }

  async generateResponse(prompt: string, history: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // Format the conversation history for Gemini
      const chat = this.model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      throw new Error('Failed to generate response. Please try again later.');
    }
  }
}

export default GeminiService;
