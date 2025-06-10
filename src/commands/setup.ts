import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, ChannelType, GuildChannel, Role } from 'discord.js';
import { Command } from '../types/Command';
import { logger } from '../utils/logger';

const categories = {
  '🌀 GameDin Core': {
    channels: ['welcome', 'rules-and-purpose', 'introduce-yourself', 'announcements', 'role-select'],
    description: 'Core channels for community management and announcements'
  },
  '💬 Unity Circle': {
    channels: ['gaming-chat', 'memes-and-chaos', 'vent-channel', 'coven-circle', 'after-dark', 'holy-quotes'],
    description: 'Community interaction and social channels'
  },
  '🎮 Game Rooms': {
    channels: ['matchmaking', 'roblox-din', 'fortnite-legion', 'fighting-games', 'suggest-a-game'],
    description: 'Game-specific channels and matchmaking'
  },
  '🎥 Spotlight': {
    channels: ['your-streams', 'epic-moments', 'art-and-mods'],
    description: 'Showcase your content and achievements'
  },
  '🔊 GameDin Voice': {
    channels: ['🎤 General Vibe', '🎮 Game Night VC', '🕊️ Chill Lounge', '🔒 The Throne Room', '🔥 Sacred Flame VC'],
    description: 'Voice channels for gaming and socializing'
  },
  '🛡️ Moderation': {
    channels: ['mod-logs', 'mod-chat', 'reports', 'trial-moderators'],
    description: 'Moderation and staff channels'
  }
};

const roles = {
  '👑 Sovereign': {
    color: 0xFFD700, // Gold
    permissions: PermissionFlagsBits.Administrator,
    description: 'Server Owner'
  },
  '🛡️ Guardian': {
    color: 0xFF0000, // Red
    permissions: PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageChannels,
    description: 'Senior Moderator'
  },
  '✨ Seraph': {
    color: 0xFF69B4, // Hot Pink
    permissions: PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.ManageMessages,
    description: 'Moderator'
  },
  '🌟 Trial Seraph': {
    color: 0x9370DB, // Medium Purple
    permissions: PermissionFlagsBits.ModerateMembers,
    description: 'Trial Moderator'
  },
  '💫 Member': {
    color: 0x00FF00, // Green
    permissions: 0n,
    description: 'Regular Member'
  }
};

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Initialize server channels and categories')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON(),

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      // Check for existing channels
      const existingChannels = guild.channels.cache;
      if (existingChannels.size > 0) {
        await interaction.editReply('⚠️ Server already has channels. Please delete existing channels first or use /reset to clear all channels.');
        return;
      }

      // Create roles
      const createdRoles = new Map<string, Role>();
      for (const [roleName, roleData] of Object.entries(roles)) {
        const role = await guild.roles.create({
          name: roleName,
          color: roleData.color,
          permissions: roleData.permissions,
          reason: 'GameDin server initialization',
          mentionable: true
        });
        createdRoles.set(roleName, role);
        logger.info(`Created role: ${roleName}`);
      }

      // Create categories and channels
      for (const [categoryName, categoryData] of Object.entries(categories)) {
        // Create category
        const category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: 'GameDin server initialization'
        });

        logger.info(`Created category: ${categoryName}`);

        // Create channels in category
        for (const channelName of categoryData.channels) {
          const isVoice = channelName.includes('VC') || categoryName.includes('Voice');
          const channel = await guild.channels.create({
            name: channelName,
            type: isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
            parent: category.id,
            reason: 'GameDin server initialization'
          });

          // Set channel permissions
          if (channelName === 'rules-and-purpose') {
            await channel.permissionOverwrites.create(guild.roles.everyone, {
              SendMessages: false,
              AddReactions: false
            });
          }

          if (channelName === 'vent-channel') {
            await channel.permissionOverwrites.create(guild.roles.everyone, {
              SendMessages: true,
              ReadMessageHistory: true,
              ViewChannel: true,
              AddReactions: false,
              CreatePublicThreads: false,
              CreatePrivateThreads: false,
              SendMessagesInThreads: false
            });
          }

          // Set moderation channel permissions
          if (categoryName === '🛡️ Moderation') {
            const everyoneRole = guild.roles.everyone;
            const trialRole = createdRoles.get('🌟 Trial Seraph');
            const modRole = createdRoles.get('✨ Seraph');
            const seniorModRole = createdRoles.get('🛡️ Guardian');
            const ownerRole = createdRoles.get('👑 Sovereign');

            await channel.permissionOverwrites.create(everyoneRole, {
              ViewChannel: false
            });

            if (trialRole) {
              await channel.permissionOverwrites.create(trialRole, {
                ViewChannel: true,
                SendMessages: channelName === 'trial-moderators',
                ReadMessageHistory: true
              });
            }

            if (modRole) {
              await channel.permissionOverwrites.create(modRole, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
              });
            }

            if (seniorModRole) {
              await channel.permissionOverwrites.create(seniorModRole, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                ManageMessages: true
              });
            }

            if (ownerRole) {
              await channel.permissionOverwrites.create(ownerRole, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                ManageMessages: true,
                ManageChannels: true
              });
            }
          }

          logger.info(`Created channel: ${channelName} in ${categoryName}`);
        }
      }

      // Set up welcome message
      const welcomeChannel = guild.channels.cache.find(c => c.name === 'welcome');
      if (welcomeChannel && welcomeChannel.isTextBased()) {
        await welcomeChannel.send({
          content: `# 🌟 Welcome to GameDin! 🌟

## 🎮 About Us
GameDin is a sacred gaming community where unity, laughter, and friendship thrive. We're more than just a gaming server - we're a family!

## 📜 Quick Links
- <#${guild.channels.cache.find(c => c.name === 'rules-and-purpose')?.id}> - Read our rules and learn about our purpose
- <#${guild.channels.cache.find(c => c.name === 'introduce-yourself')?.id}> - Introduce yourself to the community
- <#${guild.channels.cache.find(c => c.name === 'role-select')?.id}> - Get your roles

## 🛡️ Moderation Team
Our dedicated team of moderators (Seraphs) is here to help:
- <@&${createdRoles.get('🛡️ Guardian')?.id}> - Senior Moderators
- <@&${createdRoles.get('✨ Seraph')?.id}> - Moderators
- <@&${createdRoles.get('🌟 Trial Seraph')?.id}> - Trial Moderators

Feel free to reach out to any of our moderators if you need assistance!`
        });
      }

      await interaction.editReply('✅ Server channels and roles have been initialized successfully!');
      logger.info(`Server setup completed for guild: ${guild.name} (${guild.id})`);

    } catch (error) {
      logger.error('Error in setup command:', error);
      await interaction.editReply('❌ An error occurred while setting up the server. Please check the logs for details.');
    }
  },

  cooldown: 300 // 5 minutes cooldown
}; 