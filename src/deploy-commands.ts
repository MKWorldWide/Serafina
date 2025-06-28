import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';
import { logger } from './utils/logger';

// Load environment variables
config();

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

// Load all commands
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  let commandExport;
  try {
    commandExport = require(filePath);
  } catch (e) {
    logger.warn(`Failed to require ${filePath}: ${e}`);
    continue;
  }
  const command = commandExport?.command;
  if (command && 'data' in command && 'execute' in command) {
    commands.push(command.data);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(`The command at ${filePath} is missing required properties`);
  }
}

// Initialize REST client
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

// Deploy commands
(async () => {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands },
    );

    logger.info(`Successfully reloaded ${(data as any[]).length} application (/) commands.`);
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})(); 