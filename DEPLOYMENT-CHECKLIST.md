# Serafina Deployment Verification Checklist

## Pre-Deployment Checks
- [ ] All services build successfully with `npm run build:all`
- [ ] Environment variables are properly set in `.env` (use `.env.example` as reference)
- [ ] Docker builds successfully with `docker build -t serafina .`
- [ ] Services start locally using `npm run start:render`

## Render Configuration
- [ ] `render.yaml` is properly configured with service names and ports
- [ ] Environment variables are added to Render dashboard
- [ ] Build command is set to `npm run build:all`
- [ ] Start command is set to `npm run start:render`
- [ ] Health check path is set to `/status` for each service

## Post-Deployment Verification
- [ ] Services are running in Render dashboard
- [ ] Check logs for any startup errors
- [ ] Test Discord bot commands that interact with services
- [ ] Verify services are accessible at their respective URLs
- [ ] Check that PM2 is managing all services properly

## Monitoring
- [ ] Set up alerts for service downtimes
- [ ] Monitor resource usage (CPU, memory, etc.)
- [ ] Check logs for any errors or warnings

## Scaling (if needed)
- [ ] Adjust instance sizes if services are under heavy load
- [ ] Configure auto-scaling rules if necessary
- [ ] Monitor performance metrics after scaling
