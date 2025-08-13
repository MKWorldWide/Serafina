// Simple test script to verify basic Discord.js functionality
const { Client, GatewayIntentBits } = require('discord.js');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Log when the bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('✅ Bot is ready!');
  process.exit(0);
});

// Log errors
client.on('error', error => {
  console.error('❌ Discord client error:', error);
  process.exit(1);
});

// Login using the token from environment variables
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ Error: DISCORD_TOKEN environment variable is not set');
  process.exit(1);
}

console.log('🔌 Connecting to Discord...');
client.login(token).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});
