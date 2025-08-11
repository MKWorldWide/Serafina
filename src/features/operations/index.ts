import { Client, Collection } from 'discord.js';
import { getLogger } from '../../utils/logger';
import { initializeJobs } from '../../jobs';
import { registerCommands } from './commands';
import { handleInteraction } from './interactions';
import { getServices } from '../../config/env';

const logger = getLogger({ service: 'operations' });

/**
 * Initialize the operations concierge feature
 * @param client Discord client instance
 */
export async function initializeOperations(client: Client): Promise<void> {
  try {
    logger.info('Initializing operations concierge...');
    
    // Verify we have services configured
    const services = getServices();
    if (services.length === 0) {
      logger.warn('No services configured for operations concierge');
      return;
    }
    
    logger.info(`Loaded ${services.length} services for monitoring`);
    
    // Register slash commands
    try {
      await registerCommands(client);
      logger.info('Registered operations commands');
    } catch (error) {
      logger.error('Failed to register operations commands', { error });
      throw error;
    }
    
    // Initialize background jobs
    try {
      initializeJobs(client);
      logger.info('Initialized background jobs');
    } catch (error) {
      logger.error('Failed to initialize background jobs', { error });
      throw error;
    }
    
    // Set up interaction handling
    client.on('interactionCreate', async interaction => {
      try {
        await handleInteraction(interaction);
      } catch (error) {
        logger.error('Error handling interaction', { 
          error, 
          interactionId: interaction.id,
          type: interaction.type,
          commandName: interaction.isCommand() ? interaction.commandName : 'N/A'
        });
        
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ An error occurred while processing your request.',
            ephemeral: true
          }).catch(() => {});
        }
      }
    });
    
    logger.info('Operations concierge initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize operations concierge', { error });
    throw error;
  }
}

export { initializeOperations };
