/**
 * Notion Sync Configuration
 * 
 * Configuration file for the Notion-GitHub documentation sync service.
 * This file contains all settings needed for bidirectional synchronization
 * between Notion documentation and GitHub repository.
 */

import { SyncConfig } from '../src/services/NotionSyncService';

export const notionSyncConfig: SyncConfig = {
  // Notion API Configuration
  notionToken: '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',
  
  // Notion Database ID (optional - for creating new pages)
  // databaseId: 'your-database-id-here',
  
  // Notion Page IDs to sync (add your specific page IDs here)
  pageIds: [
    // Add your Notion page IDs here
    // Example: '12345678-1234-1234-1234-123456789012'
  ],
  
  // GitHub Repository Configuration
  githubRepo: 'GameDinDiscord',
  
  // Local documentation path (relative to project root)
  localDocsPath: './docs/notion-sync',
  
  // Sync interval in milliseconds (default: 5 minutes)
  syncInterval: 5 * 60 * 1000,
  
  // Enable bidirectional sync (GitHub ↔ Notion)
  bidirectional: true,
};

/**
 * Environment-specific configurations
 */
export const getNotionSyncConfig = (): SyncConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  const baseConfig = { ...notionSyncConfig };
  
  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        syncInterval: 10 * 60 * 1000, // 10 minutes in production
        bidirectional: true,
      };
    
    case 'development':
      return {
        ...baseConfig,
        syncInterval: 2 * 60 * 1000, // 2 minutes in development
        bidirectional: true,
      };
    
    case 'test':
      return {
        ...baseConfig,
        syncInterval: 30 * 1000, // 30 seconds in test
        bidirectional: false, // Disable bidirectional in test
      };
    
    default:
      return baseConfig;
  }
};

/**
 * Validation function for configuration
 */
export const validateNotionSyncConfig = (config: SyncConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.notionToken) {
    errors.push('Notion token is required');
  }
  
  if (!config.pageIds || config.pageIds.length === 0) {
    errors.push('At least one Notion page ID is required');
  }
  
  if (!config.githubRepo) {
    errors.push('GitHub repository name is required');
  }
  
  if (!config.localDocsPath) {
    errors.push('Local documentation path is required');
  }
  
  if (config.syncInterval < 1000) {
    errors.push('Sync interval must be at least 1 second');
  }
  
  return errors;
};

/**
 * Default page templates for common documentation types
 */
export const pageTemplates = {
  readme: {
    title: 'README',
    content: `# Project Documentation

This document is automatically synced between Notion and GitHub.

## Overview
[Add project overview here]

## Features
[Add features list here]

## Installation
[Add installation instructions here]

## Usage
[Add usage examples here]

## Contributing
[Add contribution guidelines here]

---
*Last synced: ${new Date().toISOString()}*
`,
  },
  
  architecture: {
    title: 'Architecture',
    content: `# System Architecture

## Overview
[Add architecture overview here]

## Components
[Add component descriptions here]

## Data Flow
[Add data flow diagrams here]

## Security
[Add security considerations here]

---
*Last synced: ${new Date().toISOString()}*
`,
  },
  
  api: {
    title: 'API Documentation',
    content: `# API Documentation

## Endpoints
[Add API endpoints here]

## Authentication
[Add authentication details here]

## Examples
[Add API examples here]

---
*Last synced: ${new Date().toISOString()}*
`,
  },
  
  changelog: {
    title: 'Changelog',
    content: `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
[Add unreleased changes here]

## [1.0.0] - ${new Date().toISOString().split('T')[0]}
### Added
- Initial release

---
*Last synced: ${new Date().toISOString()}*
`,
  },
};

/**
 * Sync schedule configuration
 */
export const syncSchedule = {
  // Daily sync at 9 AM
  daily: '0 9 * * *',
  
  // Every 5 minutes during business hours (9 AM - 6 PM)
  businessHours: '*/5 9-18 * * 1-5',
  
  // Every hour
  hourly: '0 * * * *',
  
  // Every 30 minutes
  halfHourly: '*/30 * * * *',
  
  // Every 10 minutes
  frequent: '*/10 * * * *',
  
  // Every 5 minutes
  veryFrequent: '*/5 * * * *',
};

/**
 * Conflict resolution strategies
 */
export const conflictResolution = {
  // Prefer Notion changes over GitHub
  preferNotion: 'notion',
  
  // Prefer GitHub changes over Notion
  preferGitHub: 'github',
  
  // Keep both versions and create conflict file
  keepBoth: 'both',
  
  // Use timestamp to determine which is newer
  useTimestamp: 'timestamp',
  
  // Manual resolution required
  manual: 'manual',
}; 