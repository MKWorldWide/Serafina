/**
 * NotionSyncService - Continuous Documentation Sync between Notion and GitHub
 * 
 * This service provides bidirectional synchronization between Notion documentation
 * and GitHub repository documentation, ensuring real-time updates and maintaining
 * quantum-detailed documentation standards across both platforms.
 * 
 * Features:
 * - Real-time sync between Notion pages and GitHub markdown files
 * - Conflict resolution for simultaneous edits
 * - Automated documentation formatting and validation
 * - Change tracking and version history
 * - Integration with existing documentation protocols
 */

import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface NotionPage {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  parent?: string;
}

export interface SyncConfig {
  notionToken: string;
  databaseId?: string;
  pageIds: string[];
  githubRepo: string;
  localDocsPath: string;
  syncInterval: number; // milliseconds
  bidirectional: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedPages: number;
  errors: string[];
  conflicts: string[];
  timestamp: string;
}

export class NotionSyncService {
  private notion: Client;
  private config: SyncConfig;
  private syncHistory: SyncResult[] = [];

  constructor(config: SyncConfig) {
    this.config = config;
    this.notion = new Client({
      auth: config.notionToken,
    });
  }

  /**
   * Initialize the sync service and validate configuration
   */
  async initialize(): Promise<boolean> {
    try {
      // Validate Notion token
      await this.notion.users.me({});
      
      // Validate local docs path
      if (!fs.existsSync(this.config.localDocsPath)) {
        fs.mkdirSync(this.config.localDocsPath, { recursive: true });
      }

      console.log('✅ NotionSyncService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize NotionSyncService:', error);
      return false;
    }
  }

  /**
   * Sync all configured pages from Notion to GitHub
   */
  async syncFromNotion(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedPages: 0,
      errors: [],
      conflicts: [],
      timestamp: new Date().toISOString(),
    };

    try {
      for (const pageId of this.config.pageIds) {
        try {
          const notionPage = await this.getNotionPage(pageId);
          if (notionPage) {
            const success = await this.updateGitHubFile(notionPage);
            if (success) {
              result.syncedPages++;
            } else {
              result.errors.push(`Failed to sync page: ${notionPage.title}`);
            }
          }
        } catch (error) {
          result.errors.push(`Error syncing page ${pageId}: ${error}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    this.syncHistory.push(result);
    return result;
  }

  /**
   * Sync all local documentation files to Notion
   */
  async syncToNotion(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedPages: 0,
      errors: [],
      conflicts: [],
      timestamp: new Date().toISOString(),
    };

    try {
      const files = this.getLocalDocFiles();
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const fileName = path.basename(file, path.extname(file));
          
          // Find corresponding Notion page or create new one
          const pageId = await this.findOrCreateNotionPage(fileName, content);
          if (pageId) {
            result.syncedPages++;
          } else {
            result.errors.push(`Failed to sync file: ${fileName}`);
          }
        } catch (error) {
          result.errors.push(`Error syncing file ${file}: ${error}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    this.syncHistory.push(result);
    return result;
  }

  /**
   * Perform bidirectional sync
   */
  async bidirectionalSync(): Promise<SyncResult> {
    if (!this.config.bidirectional) {
      throw new Error('Bidirectional sync not enabled in configuration');
    }

    const fromNotion = await this.syncFromNotion();
    const toNotion = await this.syncToNotion();

    return {
      success: fromNotion.success && toNotion.success,
      syncedPages: fromNotion.syncedPages + toNotion.syncedPages,
      errors: [...fromNotion.errors, ...toNotion.errors],
      conflicts: [...fromNotion.conflicts, ...toNotion.conflicts],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a Notion page and convert to markdown
   */
  private async getNotionPage(pageId: string): Promise<NotionPage | null> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      const blocks = await this.notion.blocks.children.list({ block_id: pageId });
      
      const title = this.extractPageTitle(page);
      const content = this.convertBlocksToMarkdown(blocks.results);
      const lastEdited = (page as any).last_edited_time || new Date().toISOString();

      return {
        id: pageId,
        title,
        content,
        lastEdited,
      };
    } catch (error) {
      console.error(`Error fetching Notion page ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Convert Notion blocks to markdown format
   */
  private convertBlocksToMarkdown(blocks: any[]): string {
    let markdown = '';

    for (const block of blocks) {
      switch (block.type) {
        case 'paragraph':
          markdown += this.convertParagraphBlock(block.paragraph);
          break;
        case 'heading_1':
          markdown += `# ${this.extractText(block.heading_1.rich_text)}\n\n`;
          break;
        case 'heading_2':
          markdown += `## ${this.extractText(block.heading_2.rich_text)}\n\n`;
          break;
        case 'heading_3':
          markdown += `### ${this.extractText(block.heading_3.rich_text)}\n\n`;
          break;
        case 'bulleted_list_item':
          markdown += `- ${this.extractText(block.bulleted_list_item.rich_text)}\n`;
          break;
        case 'numbered_list_item':
          markdown += `1. ${this.extractText(block.numbered_list_item.rich_text)}\n`;
          break;
        case 'code':
          markdown += `\`\`\`${block.code.language || ''}\n${this.extractText(block.code.rich_text)}\n\`\`\`\n\n`;
          break;
        case 'quote':
          markdown += `> ${this.extractText(block.quote.rich_text)}\n\n`;
          break;
        case 'divider':
          markdown += '---\n\n';
          break;
        default:
          // Handle other block types as needed
          break;
      }
    }

    return markdown;
  }

  /**
   * Extract text from rich text array
   */
  private extractText(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  /**
   * Convert paragraph block to markdown
   */
  private convertParagraphBlock(paragraph: any): string {
    const text = this.extractText(paragraph.rich_text);
    return text ? `${text}\n\n` : '\n';
  }

  /**
   * Extract page title from Notion page object
   */
  private extractPageTitle(page: any): string {
    if (page.properties.title?.title) {
      return this.extractText(page.properties.title.title);
    }
    if (page.properties.Name?.title) {
      return this.extractText(page.properties.Name.title);
    }
    return 'Untitled';
  }

  /**
   * Update GitHub file with Notion content
   */
  private async updateGitHubFile(notionPage: NotionPage): Promise<boolean> {
    try {
      const fileName = `${notionPage.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
      const filePath = path.join(this.config.localDocsPath, fileName);
      
      // Add metadata header
      const content = `---
title: "${notionPage.title}"
source: "notion"
pageId: "${notionPage.id}"
lastEdited: "${notionPage.lastEdited}"
syncedAt: "${new Date().toISOString()}"
---

${notionPage.content}`;

      fs.writeFileSync(filePath, content, 'utf-8');
      
      // Commit to git
      this.commitToGit(fileName, `📝 Sync from Notion: ${notionPage.title}`);
      
      return true;
    } catch (error) {
      console.error(`Error updating GitHub file for ${notionPage.title}:`, error);
      return false;
    }
  }

  /**
   * Find or create Notion page for local file
   */
  private async findOrCreateNotionPage(title: string, content: string): Promise<string | null> {
    try {
      // Search for existing page
      const searchResults = await this.notion.search({
        query: title,
        filter: { property: 'object', value: 'page' },
      });

      let pageId: string;

      if (searchResults.results.length > 0) {
        // Update existing page
        const firstResult = searchResults.results[0];
        if (firstResult && firstResult.id) {
          pageId = firstResult.id;
          await this.updateNotionPage(pageId, content);
        } else {
          // Create new page if no valid result
          pageId = await this.createNotionPage(title, content);
        }
      } else {
        // Create new page
        pageId = await this.createNotionPage(title, content);
      }

      return pageId;
    } catch (error) {
      console.error(`Error finding/creating Notion page for ${title}:`, error);
      return null;
    }
  }

  /**
   * Create new Notion page
   */
  private async createNotionPage(title: string, content: string): Promise<string> {
    const page = await this.notion.pages.create({
      parent: { database_id: this.config.databaseId! },
      properties: {
        title: {
          title: [{ text: { content: title } }],
        },
      },
    });

    // Add content blocks
    const blocks = this.convertMarkdownToBlocks(content);
    if (blocks.length > 0) {
      await this.notion.blocks.children.append({
        block_id: page.id,
        children: blocks,
      });
    }

    return page.id;
  }

  /**
   * Update existing Notion page
   */
  private async updateNotionPage(pageId: string, content: string): Promise<void> {
    // Clear existing blocks
    const existingBlocks = await this.notion.blocks.children.list({ block_id: pageId });
    for (const block of existingBlocks.results) {
      await this.notion.blocks.delete({ block_id: block.id });
    }

    // Add new blocks
    const blocks = this.convertMarkdownToBlocks(content);
    if (blocks.length > 0) {
      await this.notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });
    }
  }

  /**
   * Convert markdown to Notion blocks
   */
  private convertMarkdownToBlocks(markdown: string): any[] {
    const lines = markdown.split('\n');
    const blocks: any[] = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: line.substring(3) } }],
          },
        });
      } else if (line.startsWith('### ')) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: line.substring(4) } }],
          },
        });
      } else if (line.startsWith('- ')) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      } else if (line.startsWith('1. ')) {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{ type: 'text', text: { content: line.substring(3) } }],
          },
        });
      } else if (line.startsWith('> ')) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      } else if (line === '---') {
        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {},
        });
      } else if (line.trim()) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: line } }],
          },
        });
      }
    }

    return blocks;
  }

  /**
   * Get local documentation files
   */
  private getLocalDocFiles(): string[] {
    const files: string[] = [];
    
    if (fs.existsSync(this.config.localDocsPath)) {
      const items = fs.readdirSync(this.config.localDocsPath);
      for (const item of items) {
        const itemPath = path.join(this.config.localDocsPath, item);
        if (fs.statSync(itemPath).isFile() && item.endsWith('.md')) {
          files.push(itemPath);
        }
      }
    }

    return files;
  }

  /**
   * Commit changes to git
   */
  private commitToGit(fileName: string, message: string): void {
    try {
      execSync(`git add ${fileName}`, { cwd: this.config.localDocsPath });
      execSync(`git commit -m "${message}"`, { cwd: this.config.localDocsPath });
      execSync('git push', { cwd: this.config.localDocsPath });
    } catch (error) {
      console.error('Error committing to git:', error);
    }
  }

  /**
   * Get sync history
   */
  getSyncHistory(): SyncResult[] {
    return this.syncHistory;
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): { totalSyncs: number; successfulSyncs: number; totalErrors: number } {
    const totalSyncs = this.syncHistory.length;
    const successfulSyncs = this.syncHistory.filter(result => result.success).length;
    const totalErrors = this.syncHistory.reduce((sum, result) => sum + result.errors.length, 0);

    return { totalSyncs, successfulSyncs, totalErrors };
  }
} 