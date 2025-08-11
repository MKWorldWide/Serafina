import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';
import { config } from '../core/config';
import { createLogger } from '../core/pino-logger';

export default class ConfigCommand extends BaseCommand {
  private logger = createLogger('commands:config');
  private configurableOptions = [
    { 
      key: 'prefix', 
      name: 'Command Prefix', 
      description: 'The prefix used for text commands',
      type: 'string',
      default: '!',
      minLength: 1,
      maxLength: 5,
      requiredPermissions: [PermissionFlagsBits.ManageGuild]
    },
    { 
      key: 'locale', 
      name: 'Language', 
      description: 'The server language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Japanese', value: 'ja' },
      ],
      default: 'en',
      requiredPermissions: [PermissionFlagsBits.ManageGuild]
    },
    { 
      key: 'timezone', 
      name: 'Timezone', 
      description: 'The server timezone',
      type: 'string',
      default: 'UTC',
      requiredPermissions: [PermissionFlagsBits.ManageGuild]
    },
    { 
      key: 'mod_role_id', 
      name: 'Moderator Role', 
      description: 'The role that can use moderator commands',
      type: 'role',
      requiredPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageRoles]
    },
    { 
      key: 'welcome_channel_id', 
      name: 'Welcome Channel', 
      description: 'The channel where welcome messages are sent',
      type: 'channel',
      channelTypes: ['GUILD_TEXT'],
      requiredPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels]
    },
    { 
      key: 'log_channel_id', 
      name: 'Log Channel', 
      description: 'The channel where moderation logs are sent',
      type: 'channel',
      channelTypes: ['GUILD_TEXT'],
      requiredPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels]
    },
  ];

  constructor() {
    super();
    this.guildOnly = true; // Can only be used in guilds
    this.cooldown = 5; // 5 second cooldown
    this.permissions = [PermissionFlagsBits.ManageGuild]; // Require Manage Guild permission
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('config')
      .setDescription('Configure server-specific settings')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand(subcommand =>
        subcommand
          .setName('get')
          .setDescription('Get the value of a configuration option')
          .addStringOption(option =>
            option
              .setName('key')
              .setDescription('The configuration key to get')
              .setRequired(true)
              .addChoices(
                ...this.configurableOptions
                  .filter(opt => opt.key !== 'mod_role_id' && opt.key !== 'welcome_channel_id' && opt.key !== 'log_channel_id')
                  .map(opt => ({ name: opt.name, value: opt.key }))
              )
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('set')
          .setDescription('Set the value of a configuration option')
          .addStringOption(option =>
            option
              .setName('key')
              .setDescription('The configuration key to set')
              .setRequired(true)
              .addChoices(
                ...this.configurableOptions.map(opt => ({
                  name: opt.name,
                  value: opt.key
                }))
              )
          )
          .addStringOption(option =>
            option
              .setName('value')
              .setDescription('The value to set')
              .setRequired(false)
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setDescription('List all configuration options')
      )
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply({ ephemeral: true });

      // Check if the user has permission to use this command
      const member = interaction.member;
      const hasPermission = this.permissions.every(permission => 
        member.permissions.has(permission)
      );

      if (!hasPermission) {
        return interaction.editReply({
          content: '❌ You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      // Get the subcommand
      const subcommand = interaction.options.getSubcommand();

      // Handle the subcommand
      switch (subcommand) {
        case 'get':
          await this.handleGet(interaction);
          break;
        case 'set':
          await this.handleSet(interaction);
          break;
        case 'list':
          await this.handleList(interaction);
          break;
        default:
          await interaction.editReply({
            content: '❌ Unknown subcommand.',
            ephemeral: true,
          });
      }
    } catch (error) {
      this.logger.error('Error executing config command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        });
      }
    }
  }

  /**
   * Handle the 'get' subcommand
   */
  private async handleGet(interaction: any) {
    const key = interaction.options.getString('key');
    const option = this.configurableOptions.find(opt => opt.key === key);

    if (!option) {
      return interaction.editReply({
        content: `❌ Unknown configuration key: \`${key}\``,
        ephemeral: true,
      });
    }

    // In a real implementation, you would fetch this from your database
    // For now, we'll use a placeholder
    const currentValue = 'Not implemented yet';
    
    await interaction.editReply({
      content: `🔧 **${option.name}**\n\`${option.key}\` = \`${currentValue || 'Not set'}\`\n\n${option.description}`,
      ephemeral: true,
    });
  }

  /**
   * Handle the 'set' subcommand
   */
  private async handleSet(interaction: any) {
    const key = interaction.options.getString('key');
    let value = interaction.options.getString('value');
    const option = this.configurableOptions.find(opt => opt.key === key);

    if (!option) {
      return interaction.editReply({
        content: `❌ Unknown configuration key: \`${key}\``,
        ephemeral: true,
      });
    }

    // Check if the user has the required permissions
    const member = interaction.member;
    const hasPermission = option.requiredPermissions.every(permission => 
      member.permissions.has(permission)
    );

    if (!hasPermission) {
      return interaction.editReply({
        content: '❌ You do not have permission to modify this setting.',
        ephemeral: true,
      });
    }

    // Handle different input types
    if (option.type === 'select' || option.type === 'role' || option.type === 'channel') {
      // For these types, we'll show a select menu or other UI element
      if (option.type === 'select') {
        await this.showSelectMenu(interaction, option);
      } else if (option.type === 'role') {
        await this.showRoleSelector(interaction, option);
      } else if (option.type === 'channel') {
        await this.showChannelSelector(interaction, option);
      }
      return;
    }

    // For string inputs, validate the value
    if (value === null) {
      return interaction.editReply({
        content: `❌ Please provide a value for \`${option.key}\``,
        ephemeral: true,
      });
    }

    // Validate string length if specified
    if (option.type === 'string') {
      if (option.minLength && value.length < option.minLength) {
        return interaction.editReply({
          content: `❌ Value for \`${option.key}\` must be at least ${option.minLength} characters long.`,
          ephemeral: true,
        });
      }
      
      if (option.maxLength && value.length > option.maxLength) {
        return interaction.editReply({
          content: `❌ Value for \`${option.key}\` must be at most ${option.maxLength} characters long.`,
          ephemeral: true,
        });
      }
    }

    // In a real implementation, you would save this to your database
    // For now, we'll just show a success message
    await interaction.editReply({
      content: `✅ Successfully set \`${option.key}\` to \`${value}\`\n\n*Note: This is a demo. In a real implementation, this would be saved to a database.*`,
      ephemeral: true,
    });
  }

  /**
   * Handle the 'list' subcommand
   */
  private async handleList(interaction: any) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db) // Blue
      .setTitle('🔧 Server Configuration')
      .setDescription('Here are all the available configuration options.\nUse `/config get <key>` to view a specific setting or `/config set <key> <value>` to change it.')
      .addFields(
        this.configurableOptions.map(option => ({
          name: option.name,
          value: `\`${option.key}\` - ${option.description}\n*Type*: \`${option.type}\`${option.default ? `\n*Default*: \`${option.default}\`` : ''}`,
          inline: false,
        }))
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  /**
   * Show a select menu for the given option
   */
  private async showSelectMenu(interaction: any, option: any) {
    if (!option.options || option.options.length === 0) {
      return interaction.editReply({
        content: '❌ No options available for this setting.',
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`config_select_${option.key}`)
          .setPlaceholder(`Select ${option.name.toLowerCase()}`)
          .addOptions(
            option.options.map((opt: any) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(opt.label)
                .setDescription(opt.description || '')
                .setValue(opt.value)
            )
          )
      );

    await interaction.editReply({
      content: `🔧 Select a value for **${option.name}**:`,
      components: [row],
      ephemeral: true,
    });

    // Handle the select menu interaction
    const filter = (i: any) => i.customId === `config_select_${option.key}` && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i: any) => {
      if (i.isStringSelectMenu()) {
        const value = i.values[0];
        
        // In a real implementation, you would save this to your database
        // For now, we'll just show a success message
        await i.update({
          content: `✅ Successfully set \`${option.key}\` to \`${value}\`\n\n*Note: This is a demo. In a real implementation, this would be saved to a database.*`,
          components: [],
        });
      }
    });
  }

  /**
   * Show a role selector for the given option
   */
  private async showRoleSelector(interaction: any, option: any) {
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`config_role_${option.key}`)
          .setPlaceholder(`Select ${option.name.toLowerCase()}`)
          .addOptions(
            interaction.guild.roles.cache
              .sort((a: any, b: any) => b.position - a.position)
              .first(25)
              .map((role: any) => ({
                label: role.name,
                value: role.id,
                description: `ID: ${role.id}`,
              }))
          )
      );

    await interaction.editReply({
      content: `🔧 Select a role for **${option.name}**:`,
      components: [row],
      ephemeral: true,
    });

    // Handle the select menu interaction
    const filter = (i: any) => i.customId === `config_role_${option.key}` && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i: any) => {
      if (i.isStringSelectMenu()) {
        const roleId = i.values[0];
        const role = interaction.guild.roles.cache.get(roleId);
        
        if (!role) {
          return i.update({
            content: '❌ Could not find the selected role.',
            components: [],
            ephemeral: true,
          });
        }
        
        // In a real implementation, you would save this to your database
        // For now, we'll just show a success message
        await i.update({
          content: `✅ Successfully set \`${option.key}\` to ${role} (\`${role.id}\`)\n\n*Note: This is a demo. In a real implementation, this would be saved to a database.*`,
          components: [],
        });
      }
    });
  }

  /**
   * Show a channel selector for the given option
   */
  private async showChannelSelector(interaction: any, option: any) {
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`config_channel_${option.key}`)
          .setPlaceholder(`Select ${option.name.toLowerCase()}`)
          .addOptions(
            interaction.guild.channels.cache
              .filter((channel: any) => 
                option.channelTypes ? option.channelTypes.includes(channel.type) : true
              )
              .sort((a: any, b: any) => a.position - b.position)
              .first(25)
              .map((channel: any) => ({
                label: `#${channel.name}`,
                value: channel.id,
                description: `ID: ${channel.id}`,
              }))
          )
      );

    await interaction.editReply({
      content: `🔧 Select a channel for **${option.name}**:`,
      components: [row],
      ephemeral: true,
    });

    // Handle the select menu interaction
    const filter = (i: any) => i.customId === `config_channel_${option.key}` && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i: any) => {
      if (i.isStringSelectMenu()) {
        const channelId = i.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);
        
        if (!channel) {
          return i.update({
            content: '❌ Could not find the selected channel.',
            components: [],
            ephemeral: true,
          });
        }
        
        // In a real implementation, you would save this to your database
        // For now, we'll just show a success message
        await i.update({
          content: `✅ Successfully set \`${option.key}\` to ${channel} (\`${channel.id}\`)\n\n*Note: This is a demo. In a real implementation, this would be saved to a database.*`,
          components: [],
        });
      }
    });
  }
}
