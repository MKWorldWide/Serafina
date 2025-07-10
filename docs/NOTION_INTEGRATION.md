# Notion-GitHub Documentation Integration

## Overview

The Notion-GitHub Documentation Integration provides seamless bidirectional synchronization between Notion documentation and GitHub repository documentation. This system ensures that your documentation stays up-to-date across both platforms automatically, maintaining quantum-detailed documentation standards.

## Features

- 🔄 **Bidirectional Sync**: Sync changes from Notion to GitHub and vice versa
- ⏰ **Automated Scheduling**: Configurable sync intervals and GitHub Actions integration
- 📊 **Conflict Resolution**: Intelligent handling of simultaneous edits
- 📈 **Monitoring & Reporting**: Comprehensive sync status and health monitoring
- 🔧 **CLI Interface**: Easy-to-use command-line tools for manual operations
- 🛡️ **Error Handling**: Robust error handling with detailed logging
- 📋 **Templates**: Pre-built documentation templates for common use cases

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Notion API    │◄──►│  NotionSyncService│◄──►│  GitHub Repo    │
│                 │    │                  │    │                 │
│ • Pages         │    │ • Sync Logic     │    │ • Markdown      │
│ • Databases     │    │ • Conflict Res.  │    │ • Git Commits   │
│ • Blocks        │    │ • Format Convert │    │ • Pull Requests │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  GitHub Actions  │
                       │                  │
                       │ • Scheduled Sync │
                       │ • Manual Triggers│
                       │ • Health Checks  │
                       └──────────────────┘
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Notion API token with appropriate permissions
- GitHub repository with write access
- Git configured locally

### 2. Installation

The integration is already included in the project. Install dependencies:

```bash
npm install
```

### 3. Configuration

Edit `config/notion-sync.config.ts` to configure your sync settings:

```typescript
export const notionSyncConfig: SyncConfig = {
  notionToken: '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',
  pageIds: [
    // Add your Notion page IDs here
    '12345678-1234-1234-1234-123456789012'
  ],
  githubRepo: 'GameDinDiscord',
  localDocsPath: './docs/notion-sync',
  syncInterval: 5 * 60 * 1000, // 5 minutes
  bidirectional: true,
};
```

### 4. Initialize

```bash
npm run notion-sync:init
```

This will:
- Validate your configuration
- Test Notion API connection
- Create local documentation directory
- Generate initial documentation templates

### 5. First Sync

```bash
npm run notion-sync:sync
```

## Usage

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize sync service | `npm run notion-sync:init` |
| `sync` | Perform manual sync | `npm run notion-sync:sync` |
| `status` | Show sync status | `npm run notion-sync:status` |
| `watch` | Start auto-sync mode | `npm run notion-sync:watch` |
| `validate` | Validate configuration | `npm run notion-sync:validate` |

### Manual Sync

```bash
# Bidirectional sync (default)
npm run notion-sync:sync

# Sync from Notion to GitHub only
npm run notion-sync -- sync --direction=notion-to-github

# Sync from GitHub to Notion only
npm run notion-sync -- sync --direction=github-to-notion
```

### Watch Mode

Start continuous sync with automatic interval:

```bash
npm run notion-sync:watch
```

This will sync every 5 minutes (configurable) and show real-time status.

### Status Monitoring

Check sync health and statistics:

```bash
npm run notion-sync:status
```

Output includes:
- Configuration validation
- Sync history and statistics
- Local file status
- Connection health

## GitHub Actions Integration

### Automatic Triggers

The integration includes GitHub Actions workflows that automatically sync documentation:

1. **Scheduled Sync**: Every 6 hours
2. **Push Triggers**: When documentation files change
3. **Pull Request Triggers**: When PRs modify documentation
4. **Manual Triggers**: On-demand sync from GitHub UI

### Workflow Features

- ✅ **Automatic Validation**: Config and connection testing
- 🔄 **Smart Sync**: Only syncs when changes are detected
- 📊 **Detailed Reporting**: Comprehensive sync reports
- 🚨 **Error Handling**: Automatic issue creation on failures
- 💬 **PR Comments**: Sync status comments on pull requests
- 📁 **Artifact Storage**: Sync reports stored as artifacts

### Manual Workflow Trigger

1. Go to GitHub repository → Actions
2. Select "Notion Documentation Sync"
3. Click "Run workflow"
4. Choose sync direction and options
5. Click "Run workflow"

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
NOTION_TOKEN=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
NODE_ENV=development
```

### GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add `NOTION_TOKEN` with your Notion API token

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `notionToken` | string | required | Notion API token |
| `databaseId` | string | optional | Notion database ID for new pages |
| `pageIds` | string[] | required | Array of Notion page IDs to sync |
| `githubRepo` | string | required | GitHub repository name |
| `localDocsPath` | string | './docs/notion-sync' | Local documentation path |
| `syncInterval` | number | 300000 | Sync interval in milliseconds |
| `bidirectional` | boolean | true | Enable bidirectional sync |

### Environment-Specific Configs

The system automatically adjusts settings based on environment:

- **Development**: 2-minute sync interval, bidirectional enabled
- **Production**: 10-minute sync interval, bidirectional enabled
- **Test**: 30-second sync interval, bidirectional disabled

## Documentation Templates

### Available Templates

The system includes pre-built templates for common documentation types:

- **README**: Project overview and setup instructions
- **Architecture**: System design and component documentation
- **API**: API endpoint documentation and examples
- **Changelog**: Version history and release notes

### Using Templates

```bash
# Show available templates
npm run notion-sync -- templates

# Create template-based documentation
npm run notion-sync -- create-template readme
```

### Custom Templates

Add custom templates to `config/notion-sync.config.ts`:

```typescript
export const pageTemplates = {
  // ... existing templates
  custom: {
    title: 'Custom Template',
    content: `# Custom Documentation

## Overview
[Your content here]

---
*Last synced: ${new Date().toISOString()}*
`,
  },
};
```

## Conflict Resolution

### Resolution Strategies

The system supports multiple conflict resolution strategies:

1. **Prefer Notion**: Notion changes override GitHub
2. **Prefer GitHub**: GitHub changes override Notion
3. **Keep Both**: Create conflict files for manual resolution
4. **Use Timestamp**: Newer changes win
5. **Manual**: Require manual intervention

### Conflict Detection

Conflicts are detected when:
- Same content is modified in both platforms
- File structure changes conflict
- API rate limits are exceeded
- Network connectivity issues occur

### Handling Conflicts

When conflicts occur:

1. System logs conflict details
2. Creates conflict report
3. Applies configured resolution strategy
4. Notifies via GitHub Actions
5. Stores conflict artifacts

## Monitoring & Troubleshooting

### Sync Health Monitoring

Monitor sync health with:

```bash
npm run notion-sync:status
```

### Common Issues

#### 1. Notion API Errors

**Symptoms**: 401/403 errors, connection failures
**Solutions**:
- Verify API token is valid
- Check token permissions
- Ensure page IDs are correct

#### 2. GitHub Permission Errors

**Symptoms**: Push failures, authentication errors
**Solutions**:
- Verify GitHub token permissions
- Check repository access
- Validate branch protection rules

#### 3. Sync Conflicts

**Symptoms**: Conflict warnings, sync failures
**Solutions**:
- Review conflict reports
- Manually resolve conflicts
- Adjust resolution strategy

#### 4. Rate Limiting

**Symptoms**: 429 errors, sync delays
**Solutions**:
- Increase sync intervals
- Reduce page count
- Implement exponential backoff

### Debug Mode

Enable debug logging:

```bash
DEBUG=notion-sync:* npm run notion-sync:sync
```

### Log Files

Sync logs are stored in:
- `logs/notion-sync.log` - Application logs
- GitHub Actions artifacts - Workflow logs
- Console output - Real-time status

## Security Considerations

### API Token Security

- Store tokens in environment variables
- Use GitHub Secrets for CI/CD
- Rotate tokens regularly
- Limit token permissions

### Data Privacy

- Sync only necessary documentation
- Avoid sensitive data in public repos
- Use private repositories when needed
- Implement access controls

### Rate Limiting

- Respect API rate limits
- Implement exponential backoff
- Monitor usage patterns
- Optimize sync frequency

## Best Practices

### Documentation Structure

1. **Organize by Type**: Group related documentation
2. **Use Consistent Formatting**: Follow markdown standards
3. **Include Metadata**: Add sync timestamps and source info
4. **Version Control**: Track changes with git

### Sync Strategy

1. **Start Small**: Begin with few pages
2. **Monitor Closely**: Watch for conflicts and errors
3. **Gradual Expansion**: Add pages incrementally
4. **Regular Review**: Audit sync logs and reports

### Maintenance

1. **Regular Validation**: Run validation checks
2. **Update Configurations**: Keep settings current
3. **Monitor Performance**: Track sync efficiency
4. **Backup Data**: Maintain documentation backups

## API Reference

### NotionSyncService

```typescript
class NotionSyncService {
  constructor(config: SyncConfig)
  initialize(): Promise<boolean>
  syncFromNotion(): Promise<SyncResult>
  syncToNotion(): Promise<SyncResult>
  bidirectionalSync(): Promise<SyncResult>
  getSyncHistory(): SyncResult[]
  getSyncStats(): SyncStats
}
```

### SyncResult Interface

```typescript
interface SyncResult {
  success: boolean
  syncedPages: number
  errors: string[]
  conflicts: string[]
  timestamp: string
}
```

### SyncConfig Interface

```typescript
interface SyncConfig {
  notionToken: string
  databaseId?: string
  pageIds: string[]
  githubRepo: string
  localDocsPath: string
  syncInterval: number
  bidirectional: boolean
}
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run tests: `npm test`
5. Start development: `npm run dev`

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document all public APIs

## Support

### Getting Help

1. Check the troubleshooting section
2. Review GitHub Issues
3. Consult the documentation
4. Contact the development team

### Reporting Issues

When reporting issues, include:
- Error messages and logs
- Configuration details
- Steps to reproduce
- Environment information

### Feature Requests

Submit feature requests with:
- Detailed description
- Use case examples
- Expected behavior
- Priority level

---

*This documentation is automatically synced between Notion and GitHub. Last updated: 2024-01-27* 