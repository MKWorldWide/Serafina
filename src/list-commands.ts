import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get and validate environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN || '');

async function listCommands() {
  try {
    if (!DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID is not defined');
    }

    console.log('Fetching application commands...');
    
    // Get global commands
    const globalCommands = await rest.get(Routes.applicationCommands(DISCORD_CLIENT_ID));
    console.log('\n=== Global Commands ===');
    console.log(JSON.stringify(globalCommands, null, 2));
    
    if (DISCORD_GUILD_ID) {
      // Get guild-specific commands
      const guildCommands = await rest.get(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
      );
      console.log('\n=== Guild Commands ===');
      console.log(JSON.stringify(guildCommands, null, 2));
    }
    
    console.log('\nCommand listing complete.');
  } catch (error) {
    console.error('Error listing commands:', error);
  }
}

listCommands();
