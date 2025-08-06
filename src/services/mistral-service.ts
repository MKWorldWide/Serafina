import fetch from 'node-fetch';

export class MistralService {
  private apiKey: string;
  private readonly BASE_URL = 'https://api.mistral.ai/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Mistral API key is required');
    }
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, history: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // Format the conversation history for Mistral
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ];

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0.6,
          stop: ['\nUser:', '\n\n']
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mistral API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || "I'm not sure how to respond to that.";
    } catch (error) {
      console.error('Error generating response with Mistral:', error);
      throw new Error('Failed to generate response. Please try again later.');
    }
  }
}

export default MistralService;
