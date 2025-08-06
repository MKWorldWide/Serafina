/**
 * 🚀 GameDin Discord Bot - Enhanced Command Deployer
 * 
 * This script handles deployment of slash commands to Discord with improved error handling,
 * progress tracking, and support for both global and guild-specific deployments.
 * 
 * @author NovaSanctum
 * @version 2.0.0
 */

import { REST, Routes, ApplicationCommand, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

// Configure logging
const log = {
  info: (message: string) => console.log(chalk.blue(`[INFO] ${message}`)),
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  warn: (message: string) => console.log(chalk.yellow(`⚠️  ${message}`)),
  error: (message: string, error?: unknown) => {
    console.error(chalk.red(`❌ ${message}`));
    if (error) console.error(error);
  },
  divider: () => console.log(chalk.gray('─'.repeat(50)))
};

// Validate required environment variables
const validateEnv = (): boolean => {
  const requiredVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Load commands from the commands directory
const loadCommands = (): RESTPostAPIChatInputApplicationCommandsJSONBody[] => {
  try {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    
    for (const file of commandFiles) {
      try {
        const filePath = join(commandsPath, file);
        const command = require(filePath).default;
        
        if (!command.data || !command.data.toJSON) {
          log.warn(`Skipping invalid command file: ${file}`);
          continue;
        }
        
        commands.push(command.data.toJSON());
        log.info(`Loaded command: ${command.data.name}`);
      } catch (error) {
        log.error(`Error loading command from ${file}:`, error);
      }
    }
    
    if (commands.length === 0) {
      log.warn('No valid commands found. Using default commands as fallback.');
      return getDefaultCommands();
    }
    
    return commands;
  } catch (error) {
    log.error('Error loading commands. Using default commands as fallback.', error);
    return getDefaultCommands();
  }
};

// Default commands to use if loading from files fails
const getDefaultCommands = (): RESTPostAPIChatInputApplicationCommandsJSONBody[] => [
  {
    name: 'setup',
    description: 'Initialize server channels and categories',
    default_member_permissions: '8', // Administrator
  },
  {
    name: 'ping',
    description: 'Check if the bot is online',
    default_member_permissions: '8', // Administrator
  },
  {
    name: 'help',
    description: 'Show available commands',
    default_member_permissions: '8', // Administrator
  },
  {
    name: 'warn',
    description: 'Warn a user',
    default_member_permissions: '8', // Administrator
    options: [
      {
        name: 'user',
        description: 'The user to warn',
        type: 6, // User type
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for the warning',
        type: 3, // String type
        required: true,
      },
    ],
  },
  {
    name: 'xp',
    description: 'Check your XP level',
    default_member_permissions: '8', // Administrator
  },
  {
    name: 'leaderboard',
    description: 'Show XP leaderboard',
    default_member_permissions: '8', // Administrator
  },
];

// Main deployment function
const deployCommands = async () => {
  log.divider();
  log.info('🚀 Starting GameDin command deployment');
  log.divider();
  
  // Validate environment
  if (!validateEnv()) {
    process.exit(1);
  }
  
  const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN!);
  
  try {
    // Load commands
    const commands = loadCommands();
    log.success(`Loaded ${commands.length} commands`);
    
    // Deploy commands
    log.info('Deploying commands...');
    
    if (DISCORD_GUILD_ID) {
      // Deploy to specific guild (faster for development)
      log.info(`Deploying to guild: ${DISCORD_GUILD_ID}`);
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, DISCORD_GUILD_ID),
        { body: commands }
      );
      log.success(`Successfully deployed ${commands.length} commands to guild ${DISCORD_GUILD_ID}`);
    } else {
      // Deploy globally (slower, but works for all guilds)
      log.warn('No guild ID provided. Deploying commands globally (this can take up to an hour to update).');
      log.info('For faster development, set the DISCORD_GUILD_ID in your .env file.');
      
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID!), 
        { body: commands }
      );
      log.success(`Successfully deployed ${commands.length} commands globally`);
    }
    
    log.divider();
    log.success('✨ Command deployment completed successfully!');
    log.divider();
    
  } catch (error) {
    log.error('Failed to deploy commands:', error);
    process.exit(1);
  }
};

// Run the deployment
deployCommands();
