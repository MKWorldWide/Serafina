import { Request, Response } from 'express';
import { BaseService } from './base-service';

declare const require: any;
declare const module: any;

export class AthenaCoreService extends BaseService {
  constructor(port: number = 8001) {
    super(port, 'AthenaCore');
  }

  protected async handleRelayMessage(req: Request, res: Response): Promise<void> {
    try {
      const { from, message, discordUser } = req.body;
      console.log(`[AthenaCore] Received message from ${from} (${discordUser}): ${message}`);
      
      // Process the message (this is where you'd add your custom logic)
      const response = {
        status: 'success',
        message: 'Message processed by AthenaCore',
        originalMessage: message,
        analysis: 'This is a sample response from AthenaCore',
        processedAt: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('[AthenaCore] Error processing message:', error);
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
  const port = parseInt(process.env.PORT || '8001');
  const service = new AthenaCoreService(port);
  service.start();
}
