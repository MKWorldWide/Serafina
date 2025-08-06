import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ Missing required environment variables');
  console.log('Please ensure you have set up your .env file with:');
  console.log('DISCORD_TOKEN=your_bot_token');
  console.log('DISCORD_CLIENT_ID=your_client_id');
  if (!DISCORD_GUILD_ID) {
    console.log('DISCORD_GUILD_ID=your_server_id (optional but recommended for testing)');
  }
  process.exit(1);
}

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

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log('🚀 Starting command deployment...');
    
    // Clear existing commands
    console.log('🧹 Clearing existing commands...');
    if (!DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID is not defined');
    }
    
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] });
    if (DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: [] }
      );
    }
    
    // Deploy commands
    console.log('🔄 Deploying commands...');
    
    if (DISCORD_GUILD_ID) {
      // Deploy to guild (faster for development)
      const data = await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: commands }
      ) as any[];
      
      console.log(`✅ Successfully deployed ${data.length} commands to guild ${DISCORD_GUILD_ID}`);
      console.log('🔍 The following commands are now available:');
      data.forEach((cmd: any) => console.log(`- /${cmd.name}: ${cmd.description}`));
    } else {
      // Deploy globally (slower)
      const data = await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commands }
      ) as any[];
      
      console.log(`✅ Successfully deployed ${data.length} global commands`);
      console.log('🔍 The following commands are now available:');
      data.forEach((cmd: any) => console.log(`- /${cmd.name}: ${cmd.description}`));
    }
    
    console.log('\n🎉 Deployment complete! Try using the commands in your server.');
    console.log('\n🔧 If commands still don\'t appear:');
    console.log('1. Make sure the bot is online and connected to your server');
    console.log('2. Check that the bot has the `applications.commands` scope');
    console.log('3. Try kicking and re-inviting the bot with this URL:');
    console.log(`   https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
    
  } catch (error: any) {
    console.error('❌ Failed to deploy commands:');
    console.error(error);
    
    if (!error.code) {
      console.error('Unknown error occurred. Please check your configuration and try again.');
      process.exit(1);
    }
    
    if (error.code === 50001) {
      console.log('\n🔒 Error: Missing Access - Make sure the bot has been invited with the `applications.commands` scope');
    } else if (error.code === 50013) {
      console.log('\n🔒 Error: Missing Permissions - The bot needs the `applications.commands` scope');
    } else if (error.code === 10004) {
      console.log('\n🔍 Error: Unknown Application - Check that the CLIENT_ID in your .env is correct');
    } else if (error.code === 30001) {
      console.log('\n🔒 Error: Maximum number of guild commands reached (100) - Try deleting some commands or using global commands');
    }
    
    process.exit(1);
  }
}

deployCommands();
