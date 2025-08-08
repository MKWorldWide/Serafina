import { Request, Response } from 'express';
import { BaseService } from './base-service';

declare const require: any;
declare const module: any;

export class DivinaService extends BaseService {
  constructor(port: number = 8002) {
    super(port, 'Divina');
  }

  protected async handleRelayMessage(req: Request, res: Response): Promise<void> {
    try {
      const { from, message, discordUser } = req.body;
      console.log(`[Divina] Received message from ${from} (${discordUser}): ${message}`);
      
      // Process the message (this is where you'd add your custom logic)
      const response = {
        status: 'success',
        message: 'Message received by Divina',
        originalMessage: message,
        creativeResponse: `✨ Behold, for I am Divina! I've received your message: "${message}" and transformed it into something magical!`,
        processedAt: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('[Divina] Error processing message:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Start the service if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '8002');
  const service = new DivinaService(port);
  service.start();
}
