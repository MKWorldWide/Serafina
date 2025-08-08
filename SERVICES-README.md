# Serafina Services

This directory contains the backend services for the Serafina Discord bot:

## Services Overview

1. **Shadow Nexus**
   - Port: 10000
   - Description: Handles core bot functionality and message processing
   - Endpoints:
     - `POST /relay` - Process incoming messages
     - `GET /status` - Service health check

2. **AthenaCore**
   - Port: 10001
   - Description: Manages knowledge and information retrieval
   - Endpoints:
     - `POST /relay` - Process knowledge requests
     - `GET /status` - Service health check

3. **Divina**
   - Port: 10002
   - Description: Handles divine interventions and special commands
   - Endpoints:
     - `POST /relay` - Process divine commands
     - `GET /status` - Service health check

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Start services in development mode:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
# Build all services
npm run build:all

# Start all services
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Monitoring

- Check service logs in the `logs/` directory
- Access health endpoints at `http://localhost:PORT/status`
- Monitor resource usage with PM2: `pm2 monit`

## Troubleshooting

- If services fail to start, check the logs in the `logs/` directory
- Ensure all required environment variables are set
- Verify ports are not in use by other applications
