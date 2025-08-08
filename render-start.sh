#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies
npm install

# Build the application
npm run build

# Start all services using PM2
pm2-runtime start ecosystem.config.js
