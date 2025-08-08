import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { RelayMessage, StatusResponse } from './types';

export abstract class BaseService {
  protected app: Express;
  protected port: number;
  protected serviceName: string;

  constructor(port: number, serviceName: string) {
    this.port = port;
    this.serviceName = serviceName;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.loggerMiddleware);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/status', (req: Request, res: Response) => {
      const response: StatusResponse = {
        status: 'operational',
        service: this.serviceName,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    });

    // Message relay endpoint
    this.app.post('/relay', this.handleRelayMessage.bind(this));
  }

  private loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  }

  // Abstract method to be implemented by child classes
  protected abstract handleRelayMessage(req: Request, res: Response): Promise<void>;

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`[${this.serviceName}] Service running on port ${this.port}`);
    });
  }
}
