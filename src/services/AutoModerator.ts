import { Message, TextChannel, GuildMember, EmbedBuilder, Guild, GuildBasedChannel } from 'discord.js';
import { SERVER_CONFIG } from '../config/serverConfig';
import { logger } from '../utils/logger';

interface UserActivity {
  messageCount: number;
  lastMessageTime: number;
  warnings: number;
  mutes: number;
}

export class AutoModerator {
  private userActivity = new Map<string, UserActivity>();
  private spamThreshold = SERVER_CONFIG.autoMod.spamThreshold;
  private spamWindow = SERVER_CONFIG.autoMod.spamWindow;
  private toxicWords = SERVER_CONFIG.autoMod.toxicWords;

  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const currentTime = Date.now();

    // Initialize user activity if not exists
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, {
        messageCount: 0,
        lastMessageTime: currentTime,
        warnings: 0,
        mutes: 0
      });
    }

    const userData = this.userActivity.get(userId)!;

    // Check for spam
    if (await this.checkSpam(message, userData, currentTime)) {
      return;
    }

    // Check for toxic content
    if (await this.checkToxicContent(message, userData)) {
      return;
    }

    // Check for excessive caps
    if (await this.checkExcessiveCaps(message, userData)) {
      return;
    }

    // Check for link spam
    if (await this.checkLinkSpam(message, userData)) {
      return;
    }

    // Update user activity
    userData.messageCount++;
    userData.lastMessageTime = currentTime;
  }

  private async checkSpam(message: Message, userData: UserActivity, currentTime: number): Promise<boolean> {
    if (userData.messageCount >= this.spamThreshold) {
      await this.handleSpam(message, userData);
      return true;
    }

    // Reset message count after spam window
    if (currentTime - userData.lastMessageTime > this.spamWindow) {
      userData.messageCount = 0;
    }

    return false;
  }

  private async checkToxicContent(message: Message, userData: UserActivity): Promise<boolean> {
    const content = message.content.toLowerCase();
    const hasToxicWord = this.toxicWords.some(word => content.includes(word));

    if (hasToxicWord) {
      await this.handleToxicContent(message, userData);
      return true;
    }

    return false;
  }

  private async checkExcessiveCaps(message: Message, userData: UserActivity): Promise<boolean> {
    const content = message.content;
    const totalChars = content.length;
    const upperChars = content.replace(/[^A-Z]/g, '').length;
    const capsPercentage = (upperChars / totalChars) * 100;

    if (totalChars > 10 && capsPercentage > 70) {
      await this.handleExcessiveCaps(message, userData);
      return true;
    }

    return false;
  }

  private async checkLinkSpam(message: Message, userData: UserActivity): Promise<boolean> {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls && urls.length > 2) {
      await this.handleLinkSpam(message, userData);
      return true;
    }

    return false;
  }

  private async handleSpam(message: Message, userData: UserActivity): Promise<void> {
    try {
      await message.delete();
      userData.warnings++;

      const embed = new EmbedBuilder()
        .setTitle('🚫 Spam Detected')
        .setColor(0xFF0000)
        .setDescription(`**User:** ${message.author.tag}\n**Action:** Message deleted\n**Reason:** Sending messages too quickly\n**Warning Count:** ${userData.warnings}`)
        .setTimestamp();

      await this.logModAction(message.guild!, embed);

      // Auto-mute after 3 warnings
      if (userData.warnings >= 3) {
        await this.autoMute(message.member!, 'Excessive spam warnings');
      }
    } catch (error) {
      logger.error('Error handling spam:', error);
    }
  }

  private async handleToxicContent(message: Message, userData: UserActivity): Promise<void> {
    try {
      await message.delete();
      userData.warnings++;

      const embed = new EmbedBuilder()
        .setTitle('⚠️ Toxic Content Detected')
        .setColor(0xFFA500)
        .setDescription(`**User:** ${message.author.tag}\n**Action:** Message deleted\n**Reason:** Inappropriate language detected\n**Warning Count:** ${userData.warnings}`)
        .setTimestamp();

      await this.logModAction(message.guild!, embed);

      // Send warning DM
      await this.sendWarningDM(message.author.id, 'Toxic content detected', 'Please keep the community positive and respectful.');

      // Auto-mute after 2 toxic content warnings
      if (userData.warnings >= 2) {
        await this.autoMute(message.member!, 'Multiple toxic content violations');
      }
    } catch (error) {
      logger.error('Error handling toxic content:', error);
    }
  }

  private async handleExcessiveCaps(message: Message, userData: UserActivity): Promise<void> {
    try {
      await message.delete();

      const embed = new EmbedBuilder()
        .setTitle('🔊 Excessive Caps Detected')
        .setColor(0xFFFF00)
        .setDescription(`**User:** ${message.author.tag}\n**Action:** Message deleted\n**Reason:** Excessive use of capital letters`)
        .setTimestamp();

      await this.logModAction(message.guild!, embed);
    } catch (error) {
      logger.error('Error handling excessive caps:', error);
    }
  }

  private async handleLinkSpam(message: Message, userData: UserActivity): Promise<void> {
    try {
      await message.delete();
      userData.warnings++;

      const embed = new EmbedBuilder()
        .setTitle('🔗 Link Spam Detected')
        .setColor(0xFF0000)
        .setDescription(`**User:** ${message.author.tag}\n**Action:** Message deleted\n**Reason:** Multiple links in single message\n**Warning Count:** ${userData.warnings}`)
        .setTimestamp();

      await this.logModAction(message.guild!, embed);
    } catch (error) {
      logger.error('Error handling link spam:', error);
    }
  }

  private async autoMute(member: GuildMember, reason: string): Promise<void> {
    try {
      const muteRole = member.guild.roles.cache.find(r => r.name === 'Muted');
      
      if (!muteRole) {
        // Create mute role if it doesn't exist
        const newMuteRole = await member.guild.roles.create({
          name: 'Muted',
          color: 0x808080,
          permissions: [],
          reason: 'Auto-moderation mute role'
        });

        // Set permissions for all channels
        member.guild.channels.cache.forEach(async (channel: GuildBasedChannel) => {
          if (channel.isTextBased() && 'permissionOverwrites' in channel) {
            await channel.permissionOverwrites.create(newMuteRole, {
              SendMessages: false,
              AddReactions: false
            });
          }
        });

        await member.roles.add(newMuteRole);
      } else {
        await member.roles.add(muteRole);
      }

      const embed = new EmbedBuilder()
        .setTitle('🔇 Auto-Mute Applied')
        .setColor(0xFF0000)
        .setDescription(`**User:** ${member.user.tag}\n**Action:** Auto-muted\n**Reason:** ${reason}\n**Duration:** 10 minutes`)
        .setTimestamp();

      await this.logModAction(member.guild, embed);

      // Remove mute after 10 minutes
      setTimeout(async () => {
        try {
          const muteRole = member.guild.roles.cache.find(r => r.name === 'Muted');
          if (muteRole && member.roles.cache.has(muteRole.id)) {
            await member.roles.remove(muteRole);
            
            const unmuteEmbed = new EmbedBuilder()
              .setTitle('🔊 Auto-Mute Removed')
              .setColor(0x00FF00)
              .setDescription(`**User:** ${member.user.tag}\n**Action:** Mute automatically removed`)
              .setTimestamp();

            await this.logModAction(member.guild, unmuteEmbed);
          }
        } catch (error) {
          logger.error('Error removing auto-mute:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes

    } catch (error) {
      logger.error('Error applying auto-mute:', error);
    }
  }

  private async logModAction(guild: Guild, embed: EmbedBuilder): Promise<void> {
    try {
      const modLogsChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      if (modLogsChannel?.isTextBased()) {
        await modLogsChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error logging mod action:', error);
    }
  }

  private async sendWarningDM(userId: string, reason: string, guidance: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (user) {
        const dmEmbed = new EmbedBuilder()
          .setTitle('⚠️ Warning from GameDin')
          .setColor(0xFFA500)
          .setDescription(`**Reason:** ${reason}\n\n**Guidance:** ${guidance}\n\nPlease review our community guidelines and contribute positively.`)
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      }
    } catch (error) {
      logger.error('Error sending warning DM:', error);
    }
  }

  private async getUser(userId: string): Promise<any> {
    try {
      // This would need to be implemented based on your bot's client
      return null;
    } catch (error) {
      logger.error('Error getting user:', error);
      return null;
    }
  }

  getUserActivity(userId: string): UserActivity | undefined {
    return this.userActivity.get(userId);
  }

  resetUserActivity(userId: string): void {
    this.userActivity.delete(userId);
  }
} 