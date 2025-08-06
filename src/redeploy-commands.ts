import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function clearAndRedeploy() {
  try {
    console.log('Clearing all application commands...');
    
    if (!DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID is not defined');
    }

    // Clear global commands
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] });
    console.log('Cleared global commands.');
    
    // Clear guild commands if guild ID is provided
    if (DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: [] }
      );
      console.log(`Cleared commands for guild ${DISCORD_GUILD_ID}.`);
    }
    
    console.log('All commands cleared. Now redeploying...');
    
    // Now run the deployment script
    const { execSync } = require('child_process');
    execSync('npx ts-node src/deploy-commands-enhanced.ts', { stdio: 'inherit' });
    
    console.log('Redeployment complete!');
  } catch (error) {
    console.error('Error during command cleanup and redeployment:', error);
    process.exit(1);
  }
}

clearAndRedeploy();
