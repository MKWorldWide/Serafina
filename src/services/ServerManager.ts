import { Guild, ChannelType, PermissionFlagsBits, Role, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { SERVER_CONFIG } from '../config/serverConfig';
import { logger } from '../utils/logger';

export class ServerManager {
  private guild: Guild;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  async initializeServer(): Promise<void> {
    try {
      logger.info(`Starting server initialization for ${this.guild.name}`);
      
      // Create roles
      await this.createRoles();
      
      // Create categories and channels
      await this.createCategoriesAndChannels();
      
      // Set up welcome message
      await this.setupWelcomeMessage();
      
      // Set up role selection
      await this.setupRoleSelection();
      
      logger.info(`Server initialization completed for ${this.guild.name}`);
    } catch (error) {
      logger.error('Error initializing server:', error);
      throw error;
    }
  }

  private async createRoles(): Promise<void> {
    const existingRoles = this.guild.roles.cache;
    
    for (const [roleName, roleConfig] of Object.entries(SERVER_CONFIG.roles)) {
      if (existingRoles.find(r => r.name === roleName)) {
        logger.info(`Role ${roleName} already exists`);
        continue;
      }

      const permissions = roleConfig.permissions.map(perm => PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]);
      
      const role = await this.guild.roles.create({
        name: roleName,
        color: roleConfig.color,
        permissions: permissions,
        reason: 'GameDin server initialization',
        mentionable: true
      });

      logger.info(`Created role: ${roleName}`);
    }
  }

  private async createCategoriesAndChannels(): Promise<void> {
    for (const [categoryName, categoryConfig] of Object.entries(SERVER_CONFIG.categories)) {
      // Create category
      let category = this.guild.channels.cache.find(c => c.name === categoryName) as CategoryChannel;
      
      if (!category) {
        category = await this.guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: 'GameDin server initialization'
        });
        logger.info(`Created category: ${categoryName}`);
      }

      // Create channels in category
      for (const channelConfig of categoryConfig.channels) {
        const existingChannel = this.guild.channels.cache.find(c => c.name === channelConfig.name);
        
        if (existingChannel) {
          logger.info(`Channel ${channelConfig.name} already exists`);
          continue;
        }

        const channel = await this.guild.channels.create({
          name: channelConfig.name,
          type: channelConfig.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
          reason: 'GameDin server initialization'
        });

        // Set channel permissions
        if ('permissions' in channelConfig && channelConfig.permissions) {
          await this.setChannelPermissions(channel, channelConfig.permissions);
        }

        logger.info(`Created channel: ${channelConfig.name} in ${categoryName}`);
      }
    }
  }

  private async setChannelPermissions(channel: TextChannel | VoiceChannel, permissions: any): Promise<void> {
    const everyoneRole = this.guild.roles.everyone;
    
    if (permissions.everyone) {
      await channel.permissionOverwrites.create(everyoneRole, permissions.everyone);
    }

    // Set moderator permissions for private channels
    if (permissions.everyone?.ViewChannel === false) {
      const modRoles = ['🌟 Trial Seraph', '✨ Seraph', '🛡️ Guardian', '👑 Sovereign'];
      
      for (const roleName of modRoles) {
        const role = this.guild.roles.cache.find(r => r.name === roleName);
        if (role) {
          await channel.permissionOverwrites.create(role, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          });
        }
      }
    }
  }

  private async setupWelcomeMessage(): Promise<void> {
    const welcomeChannel = this.guild.channels.cache.find(c => c.name === 'welcome') as TextChannel;
    if (!welcomeChannel) return;

    const welcomeEmbed = {
      title: '🌟 Welcome to GameDin! 🌟',
      description: `## 🎮 About Us
GameDin is a sacred gaming community where unity, laughter, and friendship thrive. We're more than just a gaming server - we're a family!

## 📜 Quick Links
- <#${this.guild.channels.cache.find(c => c.name === 'rules-and-purpose')?.id}> - Read our rules and learn about our purpose
- <#${this.guild.channels.cache.find(c => c.name === 'introduce-yourself')?.id}> - Introduce yourself to the community
- <#${this.guild.channels.cache.find(c => c.name === 'role-select')?.id}> - Get your roles

## 🛡️ Moderation Team
Our dedicated team of moderators (Seraphs) is here to help:
- <@&${this.guild.roles.cache.find(r => r.name === '🛡️ Guardian')?.id}> - Senior Moderators
- <@&${this.guild.roles.cache.find(r => r.name === '✨ Seraph')?.id}> - Moderators
- <@&${this.guild.roles.cache.find(r => r.name === '🌟 Trial Seraph')?.id}> - Trial Moderators

Feel free to reach out to any of our moderators if you need assistance!`,
      color: 0xFFD700,
      timestamp: new Date().toISOString()
    };

    await welcomeChannel.send({ embeds: [welcomeEmbed] });
  }

  private async setupRoleSelection(): Promise<void> {
    const roleSelectChannel = this.guild.channels.cache.find(c => c.name === 'role-select') as TextChannel;
    if (!roleSelectChannel) return;

    const roleSelectEmbed = {
      title: '🎭 Choose Your Roles',
      description: `React to get your roles and customize your experience!

🎮 **Gamer** - For active gamers
🎨 **Creator** - For content creators

Click the reactions below to get your roles!`,
      color: 0x9370DB,
      timestamp: new Date().toISOString()
    };

    const message = await roleSelectChannel.send({ embeds: [roleSelectEmbed] });
    
    // Add reactions for role selection
    await message.react('🎮');
    await message.react('🎨');
  }

  async getWelcomeMessage(): Promise<string> {
    const messages = SERVER_CONFIG.autoMod.welcomeMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  async assignDefaultRole(memberId: string): Promise<void> {
    const member = await this.guild.members.fetch(memberId);
    const memberRole = this.guild.roles.cache.find(r => r.name === '💫 Member');
    
    if (memberRole && !member.roles.cache.has(memberRole.id)) {
      await member.roles.add(memberRole);
      logger.info(`Assigned default role to ${member.user.tag}`);
    }
  }

  async checkAndCreateMissingChannels(): Promise<void> {
    const existingChannels = this.guild.channels.cache;
    
    for (const [categoryName, categoryConfig] of Object.entries(SERVER_CONFIG.categories)) {
      for (const channelConfig of categoryConfig.channels) {
        const channelExists = existingChannels.find(c => c.name === channelConfig.name);
        
        if (!channelExists) {
          logger.info(`Missing channel detected: ${channelConfig.name}, recreating...`);
          await this.createCategoriesAndChannels();
          break;
        }
      }
    }
  }
} 