import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Load package.json to get version info
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('Missing required environment variables');
  console.log('Required variables:');
  console.log('- DISCORD_TOKEN: Your bot token');
  console.log('- CLIENT_ID: Your bot application ID');
  console.log('- GUILD_ID: Your development server ID');
  process.exit(1);
}

const commands = [
  {
    name: 'relay',
    description: 'Relay a message to another service',
    options: [
      {
        name: 'service',
        type: 3,
        description: 'Service to relay to (shadow-nexus, athena, divina)',
        required: true,
        choices: [
          { name: 'Shadow Nexus', value: 'shadow-nexus' },
          { name: 'Athena', value: 'athena' },
          { name: 'Divina', value: 'divina' }
        ]
      },
      {
        name: 'message',
        type: 3,
        description: 'Message to relay',
        required: true
      }
    ]
  },
  {
    name: 'status',
    description: 'Check the status of connected services'
  },
  {
    name: 'heartbeat',
    description: 'Check if Serafina is responsive'
  }
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🌙 Deploying Serafina v${packageJson.version} commands...`);
    
    console.log('• Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully registered application commands!');
    console.log('\n✨ Serafina is ready to serve.');
    console.log('   Use /status to check service status');
    console.log('   Use /relay to send messages between services');
    console.log('   Use /heartbeat to check if I\'m alive\n');
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
    process.exit(1);
  }
})();
