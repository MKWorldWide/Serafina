/**
 * 🎮 GameDin Discord Bot - Deploy Commands (Simplified)
 *
 * This script deploys slash commands to Discord.
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const commands = [
  {
    name: 'setup',
    description: 'Initialize server channels and categories',
    default_member_permissions: '8', // Administrator
  },
  {
    name: 'ping',
    description: 'Check if the bot is online',
    default_member_permissions: null,
  },
  {
    name: 'help',
    description: 'Show available commands',
    default_member_permissions: null,
  },
  {
    name: 'warn',
    description: 'Warn a user',
    default_member_permissions: '4', // Manage Messages
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
    default_member_permissions: null,
  },
  {
    name: 'leaderboard',
    description: 'Show XP leaderboard',
    default_member_permissions: null,
  },
];

const rest = new REST({ version: '10' }).setToken(process.env['DISCORD_TOKEN']!);

(async () => {
  try {
    console.log('🎮 Started refreshing application (/) commands.');

    const clientId = process.env['DISCORD_CLIENT_ID'];
    const guildId = process.env['DISCORD_GUILD_ID'];

    if (!clientId) {
      console.error('❌ DISCORD_CLIENT_ID is required');
      process.exit(1);
    }

    if (guildId) {
      // Deploy to specific guild (faster for development)
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`✅ Successfully reloaded application (/) commands for guild ${guildId}.`);
    } else {
      // Deploy globally (slower, but works for all guilds)
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ Successfully reloaded application (/) commands globally.');
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
