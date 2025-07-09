import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Load all command files
const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(
  file => file.endsWith('.ts') || file.endsWith('.js'),
);

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const imported = require(filePath);
  // Support both default export and named 'command' export
  const cmd = imported.command || imported.default || imported;
  if (cmd && 'data' in cmd && 'execute' in cmd) {
    // If data is a builder, convert to JSON
    const data = typeof cmd.data.toJSON === 'function' ? cmd.data.toJSON() : cmd.data;
    commands.push(data);
  } else {
    logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env['DISCORD_TOKEN']!);

// Deploy commands
(async () => {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(process.env['DISCORD_CLIENT_ID']!), {
      body: commands,
    });

    logger.info(`Successfully reloaded ${(data as any[]).length} application (/) commands.`);
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
