import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { SERVER_CONFIG } from '../config/serverConfig';
import { logger } from '../utils/logger';

interface UserXP {
  userId: string;
  xp: number;
  level: number;
  lastMessageTime: number;
  lastVoiceTime: number;
  totalMessages: number;
  totalVoiceTime: number;
}

export class XPManager {
  private userXP = new Map<string, UserXP>();
  private voiceUsers = new Map<string, { joinTime: number; channelId: string }>();

  constructor() {
    // Start voice XP tracking
    setInterval(() => this.updateVoiceXP(), 60000); // Every minute
  }

  async handleMessage(member: GuildMember): Promise<void> {
    const userId = member.id;
    const currentTime = Date.now();

    // Initialize user XP if not exists
    if (!this.userXP.has(userId)) {
      this.userXP.set(userId, {
        userId,
        xp: 0,
        level: 0,
        lastMessageTime: currentTime,
        lastVoiceTime: 0,
        totalMessages: 0,
        totalVoiceTime: 0
      });
    }

    const userData = this.userXP.get(userId)!;

    // Check cooldown (30 seconds between XP gains)
    if (currentTime - userData.lastMessageTime < 30000) {
      return;
    }

    // Add XP
    userData.xp += SERVER_CONFIG.xp.messageXp;
    userData.totalMessages++;
    userData.lastMessageTime = currentTime;

    // Check for level up
    const newLevel = this.calculateLevel(userData.xp);
    if (newLevel > userData.level) {
      await this.handleLevelUp(member, userData, newLevel);
      userData.level = newLevel;
    }

    logger.debug(`XP updated for ${member.user.tag}: ${userData.xp} XP (Level ${userData.level})`);
  }

  async handleVoiceJoin(member: GuildMember, channelId: string): Promise<void> {
    this.voiceUsers.set(member.id, {
      joinTime: Date.now(),
      channelId
    });

    logger.debug(`${member.user.tag} joined voice channel ${channelId}`);
  }

  async handleVoiceLeave(member: GuildMember): Promise<void> {
    const voiceData = this.voiceUsers.get(member.id);
    if (voiceData) {
      const timeInVoice = Date.now() - voiceData.joinTime;
      await this.addVoiceXP(member, timeInVoice);
      this.voiceUsers.delete(member.id);
    }

    logger.debug(`${member.user.tag} left voice channel`);
  }

  private async updateVoiceXP(): Promise<void> {
    const currentTime = Date.now();

    for (const [userId, voiceData] of this.voiceUsers.entries()) {
      const timeInVoice = currentTime - voiceData.joinTime;
      
      // Add XP every minute
      if (timeInVoice >= 60000) {
        const member = await this.getMember(userId);
        if (member) {
          await this.addVoiceXP(member, 60000);
          voiceData.joinTime = currentTime; // Reset timer
        }
      }
    }
  }

  private async addVoiceXP(member: GuildMember, timeInVoice: number): Promise<void> {
    const userId = member.id;
    
    if (!this.userXP.has(userId)) {
      this.userXP.set(userId, {
        userId,
        xp: 0,
        level: 0,
        lastMessageTime: 0,
        lastVoiceTime: 0,
        totalMessages: 0,
        totalVoiceTime: 0
      });
    }

    const userData = this.userXP.get(userId)!;
    const xpGained = Math.floor(timeInVoice / 60000) * SERVER_CONFIG.xp.voiceXpPerMinute;
    
    userData.xp += xpGained;
    userData.totalVoiceTime += timeInVoice;

    // Check for level up
    const newLevel = this.calculateLevel(userData.xp);
    if (newLevel > userData.level) {
      await this.handleLevelUp(member, userData, newLevel);
      userData.level = newLevel;
    }
  }

  private calculateLevel(xp: number): number {
    return Math.floor(xp / SERVER_CONFIG.xp.levelMultiplier);
  }

  private async handleLevelUp(member: GuildMember, userData: UserXP, newLevel: number): Promise<void> {
    try {
      // Create level up embed
      const embed = new EmbedBuilder()
        .setTitle('🎉 Level Up!')
        .setColor(0x00FF00)
        .setDescription(`Congratulations ${member.user}! You've reached level **${newLevel}**!`)
        .addFields(
          { name: 'Total XP', value: userData.xp.toString(), inline: true },
          { name: 'Messages Sent', value: userData.totalMessages.toString(), inline: true },
          { name: 'Voice Time', value: this.formatVoiceTime(userData.totalVoiceTime), inline: true }
        )
        .setTimestamp();

      // Send to general chat
      const generalChat = member.guild.channels.cache.find(c => c.name === 'gaming-chat') as TextChannel;
      if (generalChat) {
        await generalChat.send({ embeds: [embed] });
      }

      // Check for role rewards
      await this.checkRoleRewards(member, newLevel);

      logger.info(`${member.user.tag} reached level ${newLevel}`);
    } catch (error) {
      logger.error('Error handling level up:', error);
    }
  }

  private async checkRoleRewards(member: GuildMember, level: number): Promise<void> {
    const roleRewards = [
      { level: 5, roleName: '🎮 Gamer' },
      { level: 10, roleName: '🎨 Creator' },
      { level: 25, roleName: '🌟 Veteran' },
      { level: 50, roleName: '💎 Elite' },
      { level: 100, roleName: '👑 Legend' }
    ];

    for (const reward of roleRewards) {
      if (level >= reward.level) {
        const role = member.guild.roles.cache.find(r => r.name === reward.roleName);
        if (role && !member.roles.cache.has(role.id)) {
          await member.roles.add(role);
          
          const rewardEmbed = new EmbedBuilder()
            .setTitle('🏆 Role Unlocked!')
            .setColor(0xFFD700)
            .setDescription(`Congratulations ${member.user}! You've unlocked the **${reward.roleName}** role!`)
            .setTimestamp();

          const generalChat = member.guild.channels.cache.find(c => c.name === 'gaming-chat') as TextChannel;
          if (generalChat) {
            await generalChat.send({ embeds: [rewardEmbed] });
          }

          logger.info(`${member.user.tag} unlocked role: ${reward.roleName}`);
        }
      }
    }
  }

  private formatVoiceTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private async getMember(userId: string): Promise<GuildMember | null> {
    try {
      // This would need to be implemented based on your bot's client
      return null;
    } catch (error) {
      logger.error('Error getting member:', error);
      return null;
    }
  }

  getUserXP(userId: string): UserXP | undefined {
    return this.userXP.get(userId);
  }

  getLeaderboard(): UserXP[] {
    return Array.from(this.userXP.values())
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);
  }

  resetUserXP(userId: string): void {
    this.userXP.delete(userId);
  }
} 