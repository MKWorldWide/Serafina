import { Client, Events, Guild } from 'discord.js';
import { BaseEvent } from '../core/events/base-event';

export default class GuildDeleteEvent extends BaseEvent {
  public name = Events.GuildDelete;
  public once = false;

  public async execute(client: Client, guild: Guild) {
    try {
      // Check if this was a kick or the bot left on its own
      const auditLogs = await guild.fetchAuditLogs({ 
        limit: 1, 
        type: 'BOT_REMOVE' 
      }).catch(() => null);
      
      const botRemoveLog = auditLogs?.entries.first();
      const wasKicked = !!botRemoveLog && 
        botRemoveLog.targetId === client.user?.id &&
        botRemoveLog.createdAt.getTime() > Date.now() - 10000; // Within last 10 seconds

      // Log the guild leave
      this.logEvent({
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.memberCount,
        wasKicked,
        reason: wasKicked ? botRemoveLog?.reason || 'No reason provided' : 'Bot left',
        removerId: wasKicked ? botRemoveLog?.executorId : null,
      });

      // If we were kicked, notify the bot owner
      if (wasKicked && botRemoveLog?.executor) {
        try {
          const owner = await client.users.fetch(process.env.OWNER_ID || '').catch(() => null);
          if (owner) {
            await owner.send({
              embeds: [{
                color: 0xFF0000, // Red
                title: '🚨 Bot Removed from Server',
                description: [
                  `**Server:** ${guild.name} (${guild.id})`,
                  `**Members:** ${guild.memberCount}`,
                  `**Removed by:** ${botRemoveLog.executor.tag} (${botRemoveLog.executor.id})`,
                  `**Reason:** ${botRemoveLog.reason || 'No reason provided'}`,
                  `\n**Action:** ${guild.memberCount > 100 ? 'Investigate removal' : 'No action needed'}`,
                ].join('\n'),
                timestamp: new Date().toISOString(),
              }]
            });
          }
        } catch (error) {
          this.logError(error as Error, { action: 'notifyOwner', guildId: guild.id });
        }
      }

      // Update the bot's presence to reflect the new guild count
      this.updatePresence(client);

      // Clean up any guild-specific data
      await this.cleanupGuildData(guild);
    } catch (error) {
      this.logError(error as Error, { action: 'guildDelete', guildId: guild.id });
    }
  }

  /**
   * Update the bot's presence with the current guild count
   */
  private updatePresence(client: Client) {
    try {
      const guildCount = client.guilds.cache.size;
      
      // If we're not in any guilds, set a default status
      if (guildCount === 0) {
        client.user?.setPresence({
          activities: [{ 
            name: 'for servers', 
            type: 'WATCHING' 
          }],
          status: 'idle',
        });
      } else {
        // Otherwise, update with the current guild count
        client.user?.setPresence({
          activities: [{
            name: `${guildCount} server${guildCount === 1 ? '' : 's'}`,
            type: 'WATCHING',
          }],
          status: 'online',
        });
      }
    } catch (error) {
      this.logError(error as Error, { action: 'updatePresence' });
    }
  }

  /**
   * Clean up any guild-specific data
   */
  private async cleanupGuildData(guild: Guild) {
    try {
      // Here you would clean up any guild-specific data
      // For example, removing from database, clearing caches, etc.
      // This is just a placeholder for the actual implementation
      
      // Example:
      // await database.deleteGuildData(guild.id);
      // await cache.clearGuildCache(guild.id);
      
      this.logger.info(`Cleaned up data for guild: ${guild.name} (${guild.id})`);
    } catch (error) {
      this.logError(error as Error, { 
        action: 'cleanupGuildData', 
        guildId: guild.id 
      });
    }
  }
}
