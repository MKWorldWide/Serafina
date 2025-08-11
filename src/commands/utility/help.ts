import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';
import { config } from '../core/config';
import { Collection } from 'discord.js';
import { glob } from 'glob';
import path from 'path';

// Define command category type
type CommandCategory = 'utility' | 'moderation' | 'fun' | 'configuration' | 'information';

// Define command info type
interface CommandInfo {
  name: string;
  description: string;
  category: CommandCategory;
  usage?: string;
  aliases?: string[];
  cooldown?: number;
  permissions?: string[];
}

export default class HelpCommand extends BaseCommand {
  private commands: Collection<string, CommandInfo> = new Collection();
  private categories: Set<CommandCategory> = new Set();

  constructor() {
    super();
    this.guildOnly = false; // Can be used in DMs
    this.cooldown = 5; // 5 second cooldown
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('help')
      .setDescription('Get help with commands and bot information')
      .addStringOption(option =>
        option
          .setName('command')
          .setDescription('The specific command to get help with')
          .setRequired(false)
      )
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply();

      // Load commands if not already loaded
      if (this.commands.size === 0) {
        await this.loadCommands();
      }

      // Get the specified command if any
      const commandName = interaction.options.getString('command');

      if (commandName) {
        // Show help for a specific command
        await this.showCommandHelp(interaction, commandName);
      } else {
        // Show the command list with categories
        await this.showCommandList(interaction);
      }
    } catch (error) {
      this.logger.error('Error executing help command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while fetching help information.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while fetching help information.',
          ephemeral: true 
        });
      }
    }
  }

  /**
   * Load all commands and their information
   */
  private async loadCommands() {
    // This is a simplified example - in a real implementation, you would load this
    // from your command files or a configuration file
    
    // Example commands - in a real implementation, you would load these dynamically
    const commandList: CommandInfo[] = [
      {
        name: 'ping',
        description: 'Check the bot\'s latency and status',
        category: 'utility',
        cooldown: 5,
      },
      {
        name: 'about',
        description: 'Learn more about the bot and its features',
        category: 'information',
        cooldown: 10,
      },
      {
        name: 'help',
        description: 'Get help with commands and bot information',
        category: 'utility',
        cooldown: 5,
      },
      // Add more commands as needed
    ];

    // Add commands to the collection
    for (const cmd of commandList) {
      this.commands.set(cmd.name, cmd);
      this.categories.add(cmd.category);
    }
  }

  /**
   * Show help for a specific command
   */
  private async showCommandHelp(interaction: any, commandName: string) {
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      await interaction.editReply({
        content: `❌ No command found with the name \`${commandName}\`.`,
        ephemeral: true,
      });
      return;
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x3498db) // Blue
      .setTitle(`Command: \`/${command.name}\``)
      .setDescription(command.description)
      .addFields(
        {
          name: 'Category',
          value: this.formatCategory(command.category),
          inline: true,
        },
        {
          name: 'Cooldown',
          value: `${command.cooldown || 0} seconds`,
          inline: true,
        }
      );

    // Add usage if available
    if (command.usage) {
      embed.addFields({
        name: 'Usage',
        value: `\`/${command.name} ${command.usage}\``,
        inline: false,
      });
    }

    // Add aliases if available
    if (command.aliases && command.aliases.length > 0) {
      embed.addFields({
        name: 'Aliases',
        value: command.aliases.map(a => `\`${a}\``).join(', '),
        inline: false,
      });
    }

    // Add permissions if available
    if (command.permissions && command.permissions.length > 0) {
      embed.addFields({
        name: 'Required Permissions',
        value: command.permissions.map(p => `• ${p}`).join('\n'),
        inline: false,
      });
    }

    // Add a footer with a tip
    embed.setFooter({
      text: `Use /help to see all available commands`,
    });

    // Create a back button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_list')
        .setLabel('Back to Command List')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬅️')
    );

    // Send the response
    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    // Set up a collector for the back button
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutes
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'back_to_list') {
        await i.deferUpdate();
        await this.showCommandList(interaction);
      }
    });
  }

  /**
   * Show the list of commands grouped by category
   */
  private async showCommandList(interaction: any) {
    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6) // Purple
      .setTitle('📚 Command Help')
      .setDescription(
        `Welcome to ${config.app.name}'s help menu!\n` +
          'Select a category below to view available commands, or use `/help <command>` for more information about a specific command.'
      )
      .setFooter({
        text: `Total Commands: ${this.commands.size} | ${config.app.name} v${config.app.version}`,
      });

    // Add a field for each category
    for (const category of Array.from(this.categories).sort()) {
      const categoryCommands = Array.from(this.commands.values()).filter(
        (cmd) => cmd.category === category
      );

      if (categoryCommands.length > 0) {
        embed.addFields({
          name: `${this.formatCategory(category)} (${categoryCommands.length})`,
          value: categoryCommands
            .map((cmd) => `• **\`${cmd.name}\`** - ${cmd.description}`)
            .join('\n'),
          inline: false,
        });
      }
    }

    // Create the category select menu
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Select a category')
        .addOptions(
          Array.from(this.categories).map((category) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(this.formatCategory(category))
              .setValue(category)
              .setDescription(`View ${category} commands`)
          )
        )
    );

    // Send the response
    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    // Set up a collector for the select menu
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 300000, // 5 minutes
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'help_category') {
        const selectedCategory = i.values[0] as CommandCategory;
        await i.deferUpdate();
        await this.showCategoryCommands(interaction, selectedCategory);
      }
    });
  }

  /**
   * Show commands for a specific category
   */
  private async showCategoryCommands(interaction: any, category: CommandCategory) {
    const categoryCommands = Array.from(this.commands.values()).filter(
      (cmd) => cmd.category === category
    );

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71) // Green
      .setTitle(`${this.formatCategory(category)} Commands`)
      .setDescription(
        `Here are all the available commands in the ${this.formatCategory(category)} category.\n` +
          'Use `/help <command>` for more information about a specific command.'
      )
      .addFields(
        categoryCommands.map((cmd) => ({
          name: `/${cmd.name}`,
          value: `${cmd.description}\n\`Cooldown: ${cmd.cooldown || 0}s\``,
          inline: true,
        }))
      )
      .setFooter({
        text: `Use the dropdown below to switch categories`,
      });

    // Create the category select menu
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Select a category')
        .addOptions(
          Array.from(this.categories).map((cat) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(this.formatCategory(cat))
              .setValue(cat)
              .setDescription(
                `View ${cat} commands` + (cat === category ? ' (current)' : '')
              )
              .setDefault(cat === category)
          )
        )
    );

    // Update the message
    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  }

  /**
   * Format a category name for display
   */
  private formatCategory(category: string): string {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
