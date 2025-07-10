#!/usr/bin/env ts-node

/**
 * Notion Sync CLI Tool
 * 
 * Command-line interface for managing Notion-GitHub documentation synchronization.
 * Provides commands for manual sync, configuration management, and monitoring.
 * 
 * Usage:
 *   npm run notion-sync -- init
 *   npm run notion-sync -- sync
 *   npm run notion-sync -- status
 *   npm run notion-sync -- watch
 */

import { NotionSyncService } from '../src/services/NotionSyncService';
import { getNotionSyncConfig, validateNotionSyncConfig, pageTemplates } from '../config/notion-sync.config';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

class NotionSyncCLI {
  private syncService: NotionSyncService;
  private config: any;

  constructor() {
    this.config = getNotionSyncConfig();
    this.syncService = new NotionSyncService(this.config);
  }

  /**
   * Main CLI entry point
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    try {
      switch (command) {
        case 'init':
          await this.init();
          break;
        case 'sync':
          await this.sync();
          break;
        case 'status':
          await this.status();
          break;
        case 'watch':
          await this.watch();
          break;
        case 'validate':
          await this.validate();
          break;
        case 'templates':
          await this.templates();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize the sync service
   */
  async init(): Promise<void> {
    console.log('🚀 Initializing Notion Sync Service...');
    
    const success = await this.syncService.initialize();
    if (success) {
      console.log('✅ Notion Sync Service initialized successfully');
      
      // Create docs directory if it doesn't exist
      const docsPath = path.resolve(this.config.localDocsPath);
      if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true });
        console.log(`📁 Created docs directory: ${docsPath}`);
      }
      
      // Create initial documentation files
      await this.createInitialDocs();
      
      console.log('🎉 Setup complete! You can now run "npm run notion-sync -- sync" to start syncing');
    } else {
      console.error('❌ Failed to initialize Notion Sync Service');
      process.exit(1);
    }
  }

  /**
   * Perform a manual sync
   */
  async sync(): Promise<void> {
    console.log('🔄 Starting manual sync...');
    
    const success = await this.syncService.initialize();
    if (!success) {
      console.error('❌ Failed to initialize sync service');
      process.exit(1);
    }

    const startTime = Date.now();
    
    try {
      let result;
      if (this.config.bidirectional) {
        console.log('🔄 Performing bidirectional sync...');
        result = await this.syncService.bidirectionalSync();
      } else {
        console.log('📥 Syncing from Notion to GitHub...');
        result = await this.syncService.syncFromNotion();
      }

      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ Sync completed successfully in ${duration}ms`);
        console.log(`📄 Synced ${result.syncedPages} pages`);
        
        if (result.errors.length > 0) {
          console.log(`⚠️  ${result.errors.length} errors occurred:`);
          result.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (result.conflicts.length > 0) {
          console.log(`⚠️  ${result.conflicts.length} conflicts detected:`);
          result.conflicts.forEach(conflict => console.log(`   - ${conflict}`));
        }
      } else {
        console.error('❌ Sync failed');
        result.errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
      process.exit(1);
    }
  }

  /**
   * Show sync status and statistics
   */
  async status(): Promise<void> {
    console.log('📊 Notion Sync Status');
    console.log('====================');
    
    // Configuration status
    console.log('\n🔧 Configuration:');
    console.log(`   Repository: ${this.config.githubRepo}`);
    console.log(`   Local Path: ${this.config.localDocsPath}`);
    console.log(`   Sync Interval: ${this.config.syncInterval / 1000}s`);
    console.log(`   Bidirectional: ${this.config.bidirectional ? 'Yes' : 'No'}`);
    console.log(`   Page IDs: ${this.config.pageIds.length}`);
    
    // Validation
    const errors = validateNotionSyncConfig(this.config);
    if (errors.length > 0) {
      console.log('\n❌ Configuration Errors:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ Configuration is valid');
    }
    
    // Sync history
    const history = this.syncService.getSyncHistory();
    const stats = this.syncService.getSyncStats();
    
    console.log('\n📈 Sync Statistics:');
    console.log(`   Total Syncs: ${stats.totalSyncs}`);
    console.log(`   Successful: ${stats.successfulSyncs}`);
    console.log(`   Failed: ${stats.totalSyncs - stats.successfulSyncs}`);
    console.log(`   Total Errors: ${stats.totalErrors}`);
    
    if (history.length > 0) {
      const lastSync = history[history.length - 1];
      if (lastSync) {
        console.log(`   Last Sync: ${new Date(lastSync.timestamp).toLocaleString()}`);
        console.log(`   Last Status: ${lastSync.success ? '✅ Success' : '❌ Failed'}`);
      }
    }
    
    // Local files
    const docsPath = path.resolve(this.config.localDocsPath);
    if (fs.existsSync(docsPath)) {
      const files = fs.readdirSync(docsPath).filter(file => file.endsWith('.md'));
      console.log(`\n📁 Local Files: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(docsPath, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${new Date(stats.mtime).toLocaleDateString()})`);
      });
    }
  }

  /**
   * Watch for changes and auto-sync
   */
  async watch(): Promise<void> {
    console.log('👀 Starting watch mode...');
    console.log(`🔄 Will sync every ${this.config.syncInterval / 1000} seconds`);
    console.log('Press Ctrl+C to stop');
    
    const success = await this.syncService.initialize();
    if (!success) {
      console.error('❌ Failed to initialize sync service');
      process.exit(1);
    }

    let syncCount = 0;
    
    const interval = setInterval(async () => {
      syncCount++;
      console.log(`\n🔄 Sync #${syncCount} - ${new Date().toLocaleTimeString()}`);
      
      try {
        let result;
        if (this.config.bidirectional) {
          result = await this.syncService.bidirectionalSync();
        } else {
          result = await this.syncService.syncFromNotion();
        }
        
        if (result.success) {
          console.log(`✅ Sync #${syncCount} completed - ${result.syncedPages} pages synced`);
        } else {
          console.log(`❌ Sync #${syncCount} failed - ${result.errors.length} errors`);
        }
      } catch (error) {
        console.log(`❌ Sync #${syncCount} error:`, error);
      }
    }, this.config.syncInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping watch mode...');
      clearInterval(interval);
      process.exit(0);
    });
  }

  /**
   * Validate configuration
   */
  async validate(): Promise<void> {
    console.log('🔍 Validating configuration...');
    
    const errors = validateNotionSyncConfig(this.config);
    
    if (errors.length === 0) {
      console.log('✅ Configuration is valid');
      
      // Test Notion connection
      console.log('🔗 Testing Notion connection...');
      const success = await this.syncService.initialize();
      if (success) {
        console.log('✅ Notion connection successful');
      } else {
        console.log('❌ Notion connection failed');
      }
    } else {
      console.log('❌ Configuration errors found:');
      errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }
  }

  /**
   * Show available templates
   */
  async templates(): Promise<void> {
    console.log('📋 Available Documentation Templates');
    console.log('===================================');
    
    Object.entries(pageTemplates).forEach(([key, template]) => {
      console.log(`\n📄 ${key.toUpperCase()}:`);
      console.log(`   Title: ${template.title}`);
      console.log(`   Content Preview: ${template.content.substring(0, 100)}...`);
    });
    
    console.log('\n💡 To use a template, run:');
    console.log('   npm run notion-sync -- create-template <template-name>');
  }

  /**
   * Create initial documentation files
   */
  private async createInitialDocs(): Promise<void> {
    const docsPath = path.resolve(this.config.localDocsPath);
    
    // Create README
    const readmePath = path.join(docsPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, pageTemplates.readme.content);
      console.log('📄 Created README.md template');
    }
    
    // Create sync status file
    const statusPath = path.join(docsPath, 'sync-status.md');
    const statusContent = `# Sync Status

This file tracks the synchronization status between Notion and GitHub.

## Last Sync
- **Date**: ${new Date().toISOString()}
- **Status**: Initialized
- **Pages**: ${this.config.pageIds.length}

## Configuration
- **Repository**: ${this.config.githubRepo}
- **Sync Interval**: ${this.config.syncInterval / 1000} seconds
- **Bidirectional**: ${this.config.bidirectional ? 'Yes' : 'No'}

---
*Auto-generated by Notion Sync Service*
`;
    
    fs.writeFileSync(statusPath, statusContent);
    console.log('📄 Created sync-status.md');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('Notion Sync CLI Tool');
    console.log('===================');
    console.log('');
    console.log('Commands:');
    console.log('  init      Initialize the sync service and create initial docs');
    console.log('  sync      Perform a manual sync');
    console.log('  status    Show sync status and statistics');
    console.log('  watch     Start watching for changes and auto-sync');
    console.log('  validate  Validate configuration and test connections');
    console.log('  templates Show available documentation templates');
    console.log('  help      Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  npm run notion-sync -- init');
    console.log('  npm run notion-sync -- sync');
    console.log('  npm run notion-sync -- watch');
    console.log('');
    console.log('Configuration:');
    console.log('  Edit config/notion-sync.config.ts to customize settings');
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new NotionSyncCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

export default NotionSyncCLI; 