import { Client, Events, type Interaction, type ChatInputCommandInteraction, type ContextMenuCommandInteraction } from 'discord.js';
import { BaseEvent } from '../core/events/base-event';
import type { BaseCommand } from '../core/commands/base-command';

// Cooldown tracking
const cooldowns = new Map<string, Map<string, number>>();

export default class InteractionCreateEvent extends BaseEvent {
  public name = Events.InteractionCreate;
  public once = false;

  public async execute(client: Client, interaction: Interaction) {
    try {
      // Handle chat input commands
      if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(client, interaction);
      }
      // Handle context menu commands
      else if (interaction.isContextMenuCommand()) {
        await this.handleContextMenu(client, interaction);
      }
      // Handle autocomplete interactions
      else if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(client, interaction);
      }
      // Handle button interactions
      else if (interaction.isButton()) {
        await this.handleButton(client, interaction);
      }
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        await this.handleSelectMenu(client, interaction);
      }
    } catch (error) {
      this.logError(error as Error, { interactionId: interaction.id });
      
      // Try to send an error message to the user
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        }).catch(() => {});
      } else if (interaction.isRepliable() && (interaction.replied || interaction.deferred)) {
        await interaction.followUp({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }

  /**
   * Handle slash command interactions
   */
  private async handleSlashCommand(client: Client, interaction: ChatInputCommandInteraction) {
    const command = client.commands?.get(interaction.commandName) as BaseCommand | undefined;
    
    if (!command) {
      this.logger.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // Check if command is guild only and used in DMs
    if (command.guildOnly && !interaction.inGuild()) {
      await interaction.reply({ 
        content: '❌ This command can only be used in a server.',
        ephemeral: true 
      });
      return;
    }

    // Check cooldowns
    const { cooldown } = command;
    if (cooldown && cooldown > 0) {
      const { id } = interaction.user;
      const now = Date.now();
      const timestamps = cooldowns.get(interaction.commandName) ?? new Map();
      const cooldownAmount = cooldown * 1000;

      if (timestamps.has(id)) {
        const expirationTime = timestamps.get(id)! + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = Math.ceil((expirationTime - now) / 1000);
          await interaction.reply({
            content: `⏳ Please wait ${timeLeft} more second(s) before reusing the \`${interaction.commandName}\` command.`,
            ephemeral: true,
          });
          return;
        }
      }

      // Set cooldown
      timestamps.set(id, now);
      cooldowns.set(interaction.commandName, timestamps);

      // Remove cooldown after it expires
      setTimeout(() => timestamps.delete(id), cooldownAmount);
    }

    try {
      // Execute the command
      await command.execute(interaction);
      this.logger.info(`Executed command: ${interaction.commandName}`, {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
      });
    } catch (error) {
      this.logError(error as Error, { 
        command: interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      });

      // Try to send an error message to the user
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: '❌ There was an error while executing this command!',
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: '❌ There was an error while executing this command!',
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }

  /**
   * Handle context menu interactions
   */
  private async handleContextMenu(client: Client, interaction: ContextMenuCommandInteraction) {
    const command = client.contextMenus?.get(interaction.commandName) as BaseCommand | undefined;
    
    if (!command) {
      this.logger.warn(`No context menu command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
      this.logger.info(`Executed context menu: ${interaction.commandName}`, {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        targetId: interaction.isMessageContextMenuCommand() ? interaction.targetMessage.id : interaction.targetUser.id,
      });
    } catch (error) {
      this.logError(error as Error, { 
        contextMenu: interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      });

      // Error handling similar to slash commands
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: '❌ There was an error while executing this context menu!',
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: '❌ There was an error while executing this context menu!',
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }

  /**
   * Handle autocomplete interactions
   */
  private async handleAutocomplete(client: Client, interaction: any) {
    const command = client.commands?.get(interaction.commandName) as any;
    
    if (!command?.autocomplete) {
      this.logger.warn(`No autocomplete handler for ${interaction.commandName}`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      this.logError(error as Error, { 
        command: interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId,
        focusedOption: interaction.options.getFocused(true),
      });
    }
  }

  /**
   * Handle button interactions
   */
  private async handleButton(client: Client, interaction: any) {
    // Extract the custom ID and any additional data
    const [componentId, ...params] = interaction.customId.split('_');
    const component = client.components?.get(componentId);
    
    if (!component) {
      this.logger.warn(`No component matching ${componentId} was found.`);
      return;
    }

    try {
      await component.execute(interaction, ...params);
      this.logger.info(`Handled button: ${componentId}`, {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        messageId: interaction.message.id,
      });
    } catch (error) {
      this.logError(error as Error, { 
        componentId,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: '❌ There was an error processing this button!',
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: '❌ There was an error processing this button!',
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }

  /**
   * Handle select menu interactions
   */
  private async handleSelectMenu(client: Client, interaction: any) {
    const [componentId, ...params] = interaction.customId.split('_');
    const component = client.components?.get(componentId);
    
    if (!component) {
      this.logger.warn(`No component matching ${componentId} was found.`);
      return;
    }

    try {
      await component.execute(interaction, ...params);
      this.logger.info(`Handled select menu: ${componentId}`, {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        messageId: interaction.message.id,
        values: interaction.values,
      });
    } catch (error) {
      this.logError(error as Error, { 
        componentId,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: '❌ There was an error processing this selection!',
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: '❌ There was an error processing this selection!',
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }
}
