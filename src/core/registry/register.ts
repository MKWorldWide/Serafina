import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { config } from '../config';
import { createLogger } from '../pino-logger';
import { glob } from 'glob';
import path from 'path';

const logger = createLogger('registry');

/**
 * Registers application commands with Discord's API
 * @param commands Array of command data to register
 */
export async function registerCommands(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
  if (!config.discord.token) {
    throw new Error('DISCORD_TOKEN is required');
  }

  if (!config.discord.clientId) {
    throw new Error('DISCORD_CLIENT_ID is required');
  }

  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // Register commands globally or to a specific guild
    if (config.discord.commandsScope === 'guild' && config.discord.devGuildId) {
      // Guild-specific commands (instantly available in the specified guild)
      await rest.put(
        Routes.applicationGuildCommands(
          config.discord.clientId,
          config.discord.devGuildId
        ),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${commands.length} guild (/) commands.`);
    } else {
      // Global commands (may take up to an hour to appear)
      await rest.put(
        Routes.applicationCommands(config.discord.clientId),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${commands.length} global (/) commands.`);
    }
  } catch (error) {
    logger.error('Failed to register commands:', error);
    throw error;
  }
}

/**
 * Discovers and loads all command modules from the commands directory
 */
export async function discoverCommands(): Promise<RESTPostAPIChatInputApplicationCommandsJSONBody[]> {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commandFiles = await glob(
    path.join(__dirname, '../../commands/**/*.{js,ts}').replace(/\\/g, '/'),
    { ignore: '**/*.d.ts' }
  );

  for (const file of commandFiles) {
    try {
      const { default: command } = await import(path.resolve(file));
      
      if (!command.data) {
        logger.warn(`Command at ${file} is missing required 'data' property, skipping...`);
        continue;
      }
      
      if (typeof command.execute !== 'function') {
        logger.warn(`Command at ${file} is missing required 'execute' function, skipping...`);
        continue;
      }
      
      // Add the command data to the array
      commands.push(command.data.toJSON());
      logger.debug(`Discovered command: ${command.data.name}`);
    } catch (error) {
      logger.error(`Error loading command ${file}:`, error);
    }
  }

  return commands;
}

/**
 * Main function to register all commands
 */
export async function registerAllCommands() {
  try {
    const commands = await discoverCommands();
    await registerCommands(commands);
  } catch (error) {
    logger.error('Failed to register commands:', error);
    process.exit(1);
  }
}

// Run the registration if this file is executed directly
if (require.main === module) {
  registerAllCommands();
}
