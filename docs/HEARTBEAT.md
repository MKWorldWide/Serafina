# 💓 Serafina's Heartbeat System

Serafina now includes a comprehensive heartbeat monitoring system to keep track of your services' health and status. This system provides real-time monitoring through Discord commands and automatic status updates.

## Features

- **Service Health Monitoring**: Continuously checks the status of connected services
- **Discord Commands**: Use `/status` to get a detailed report of all services
- **Automatic Presence Updates**: Serafina's status will reflect the overall health of your services
- **Concurrent Checks**: Efficiently monitors multiple services in parallel
- **Configurable Timeouts**: Set custom timeouts for service checks

## Configuration

Add these environment variables to your `.env` file:

```env
# Format: [{"name":"ServiceName","url":"https://service-url.com/health"}]
SERVICES=[
  {"name":"ShadowNexus","url":"http://localhost:10000/health"},
  {"name":"AthenaCore","url":"http://localhost:10001/health"},
  {"name":"Divina","url":"http://localhost:10002/health"}
]

# Timeout in milliseconds for health checks (default: 4000ms)
HEARTBEAT_TIMEOUT_MS=4000

# Maximum number of concurrent health checks (default: 3)
HEARTBEAT_CONCURRENCY=3
```

## Health Endpoint Requirements

Each service should expose a health endpoint that returns a JSON response with the following format:

```json
{
  "ok": true,
  "service": "ServiceName",
  "version": "1.0.0",
  "uptime": 1234.56,
  "timestamp": 1620000000000
}
```

### Example Express Health Endpoint

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ServiceName',
    version: process.env.npm_package_version || 'unknown',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Other routes and server startup...
```

## Using the Status Command

Use the `/status` command in Discord to check the status of all configured services:

```
/status
```

### Command Response

Serafina will respond with an embed showing:
- Service status (🟢 Online / 🔴 Offline)
- Response time
- HTTP status code
- Version (if available)
- Uptime (if available)
- Any error messages

## Automatic Status Updates

Serafina will automatically update her Discord presence every 60 seconds to show:
- Number of services online/offline
- Worst response time among all services

## Troubleshooting

- **Service Not Responding**: Check if the service is running and the URL is correct
- **Invalid JSON Response**: Ensure the health endpoint returns valid JSON with an `ok` field
- **Timeout Issues**: Increase `HEARTBEAT_TIMEOUT_MS` if services are slow to respond

## Development

To test the heartbeat system locally:

1. Start your services with health endpoints
2. Update the `SERVICES` environment variable with your local URLs
3. Run Serafina with `npm run dev`
4. Use the `/status` command in your Discord server

## Deployment

When deploying to production, update the service URLs in your environment variables to point to your production endpoints.
