import { BaseStore } from '../core/store/base-store';
import { logger } from '../core/pino-logger';

// Define the structure of a guild config
interface GuildConfig {
  guildId: string;
  prefix?: string;
  locale?: string;
  modRoleId?: string;
  adminRoleId?: string;
  logChannelId?: string;
  welcomeChannelId?: string;
  welcomeMessage?: string;
  autoRoleIds?: string;
  disabledCommands?: string;
  customPrefixes?: string;
  createdAt: string;
  updatedAt: string;
}

// Default values for guild config
const DEFAULT_GUILD_CONFIG: Omit<GuildConfig, 'guildId' | 'createdAt' | 'updatedAt'> = {
  prefix: '!',
  locale: 'en-US',
  welcomeMessage: 'Welcome {user} to {guild}!',
};

/**
 * Guild configuration store
 * Handles per-guild configuration using SQLite
 */
export class GuildConfigStore extends BaseStore {
  protected readonly tableName = 'guild_configs';
  protected readonly migrationTableName = 'guild_config_migrations';
  protected readonly migrations = [
    // Initial schema
    `CREATE TABLE IF NOT EXISTS ${this.tableName} (
      guild_id TEXT PRIMARY KEY,
      prefix TEXT,
      locale TEXT,
      mod_role_id TEXT,
      admin_role_id TEXT,
      log_channel_id TEXT,
      welcome_channel_id TEXT,
      welcome_message TEXT,
      auto_role_ids TEXT,
      disabled_commands TEXT,
      custom_prefixes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Add index for faster lookups
    `CREATE INDEX IF NOT EXISTS idx_guild_id ON ${this.tableName}(guild_id)`,
    
    // Add trigger for updated_at
    `CREATE TRIGGER IF NOT EXISTS update_${this.tableName}_timestamp
     AFTER UPDATE ON ${this.tableName}
     BEGIN
       UPDATE ${this.tableName} 
       SET updated_at = CURRENT_TIMESTAMP 
       WHERE guild_id = NEW.guild_id;
     END`
  ];

  constructor() {
    super();
    this.logger = logger.child({ module: 'store:guild-config' });
  }

  /**
   * Get a guild's configuration
   * Creates a default config if one doesn't exist
   */
  public async getConfig(guildId: string): Promise<GuildConfig> {
    try {
      // Try to get existing config
      const config = this.get<GuildConfig>(
        `SELECT * FROM ${this.tableName} WHERE guild_id = ?`,
        [guildId]
      );

      // Return existing config if found
      if (config) {
        return this.parseConfig(config);
      }

      // Create default config if not found
      return await this.setConfig(guildId, {});
    } catch (error) {
      this.logger.error('Failed to get guild config:', { guildId, error });
      throw error;
    }
  }

  /**
   * Set a guild's configuration
   * @param guildId The guild ID
   * @param updates Partial config to update
   */
  public async setConfig(
    guildId: string, 
    updates: Partial<Omit<GuildConfig, 'guildId' | 'createdAt' | 'updatedAt'>>
  ): Promise<GuildConfig> {
    try {
      const now = new Date().toISOString();
      
      return this.transaction(() => {
        // Check if config exists
        const exists = this.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${this.tableName} WHERE guild_id = ?`,
          [guildId]
        );

        if (exists && exists.count > 0) {
          // Update existing config
          const setClauses: string[] = [];
          const params: any[] = [];
          
          // Build SET clause
          for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
              setClauses.push(`${key} = ?`);
              params.push(value);
            }
          }
          
          // Add updated_at
          setClauses.push('updated_at = ?');
          params.push(now);
          
          // Add guild_id to params for WHERE clause
          params.push(guildId);
          
          // Execute update
          this.run(
            `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE guild_id = ?`,
            params
          );
          
          // Return updated config
          return this.get<GuildConfig>(
            `SELECT * FROM ${this.tableName} WHERE guild_id = ?`,
            [guildId]
          ) as GuildConfig;
        } else {
          // Insert new config
          const config: GuildConfig = {
            guildId,
            ...DEFAULT_GUILD_CONFIG,
            ...updates,
            createdAt: now,
            updatedAt: now,
          };
          
          // Insert new config
          this.run(
            `INSERT INTO ${this.tableName} (
              guild_id, prefix, locale, mod_role_id, admin_role_id, 
              log_channel_id, welcome_channel_id, welcome_message, 
              auto_role_ids, disabled_commands, custom_prefixes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              config.guildId,
              config.prefix,
              config.locale,
              config.modRoleId,
              config.adminRoleId,
              config.logChannelId,
              config.welcomeChannelId,
              config.welcomeMessage,
              config.autoRoleIds,
              config.disabledCommands,
              config.customPrefixes,
              config.createdAt,
              config.updatedAt
            ]
          );
          
          return config;
        }
      });
    } catch (error) {
      this.logger.error('Failed to set guild config:', { guildId, updates, error });
      throw error;
    }
  }

  /**
   * Delete a guild's configuration
   */
  public async deleteConfig(guildId: string): Promise<boolean> {
    try {
      const result = this.run(
        `DELETE FROM ${this.tableName} WHERE guild_id = ?`,
        [guildId]
      );
      
      return result.changes > 0;
    } catch (error) {
      this.logger.error('Failed to delete guild config:', { guildId, error });
      throw error;
    }
  }

  /**
   * Get a specific configuration value
   */
  public async getValue<T = any>(
    guildId: string, 
    key: keyof Omit<GuildConfig, 'guildId' | 'createdAt' | 'updatedAt'>
  ): Promise<T | undefined> {
    try {
      const config = await this.getConfig(guildId);
      return config[key] as unknown as T;
    } catch (error) {
      this.logger.error(`Failed to get config value '${key}':`, { guildId, error });
      throw error;
    }
  }

  /**
   * Set a specific configuration value
   */
  public async setValue(
    guildId: string, 
    key: keyof Omit<GuildConfig, 'guildId' | 'createdAt' | 'updatedAt'>,
    value: any
  ): Promise<void> {
    try {
      await this.setConfig(guildId, { [key]: value });
    } catch (error) {
      this.logger.error(`Failed to set config value '${key}':`, { guildId, value, error });
      throw error;
    }
  }

  /**
   * Parse database row into GuildConfig object
   */
  private parseConfig(row: any): GuildConfig {
    return {
      guildId: row.guild_id,
      prefix: row.prefix,
      locale: row.locale,
      modRoleId: row.mod_role_id,
      adminRoleId: row.admin_role_id,
      logChannelId: row.log_channel_id,
      welcomeChannelId: row.welcome_channel_id,
      welcomeMessage: row.welcome_message,
      autoRoleIds: row.auto_role_ids,
      disabledCommands: row.disabled_commands,
      customPrefixes: row.custom_prefixes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get all guild configs (paginated)
   */
  public getAllConfigs(limit = 100, offset = 0): GuildConfig[] {
    try {
      const rows = this.all<GuildConfig>(
        `SELECT * FROM ${this.tableName} ORDER BY guild_id LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return rows.map(row => this.parseConfig(row));
    } catch (error) {
      this.logger.error('Failed to get all guild configs:', { error });
      throw error;
    }
  }

  /**
   * Get the total number of guild configs
   */
  public getTotalGuilds(): number {
    try {
      const result = this.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${this.tableName}`
      );
      
      return result?.count || 0;
    } catch (error) {
      this.logger.error('Failed to get total guilds:', { error });
      throw error;
    }
  }
}
