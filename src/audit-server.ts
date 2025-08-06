import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  try {
    console.log(`✅ Bot logged in as ${client.user?.tag}`);
    
    const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
    if (!guild) {
      console.error('❌ Could not find the specified guild');
      process.exit(1);
    }

    console.log('\n🔍 Server Audit Report');
    console.log('====================');
    
    // Basic server info
    console.log(`\n📋 Server: ${guild.name} (${guild.id})`);
    console.log(`👑 Owner: ${(await guild.fetchOwner()).user.tag}`);
    console.log(`👥 Members: ${guild.memberCount}`);
    console.log(`🔐 Verification Level: ${guild.verificationLevel}`);
    console.log(`🚫 Explicit Content Filter: ${guild.explicitContentFilter}`);
    
    // List categories and channels
    console.log('\n📂 Categories and Channels:');
    console.log('----------------------');
    // Get all categories and sort them by position
    const categories = Array.from(guild.channels.cache.values())
      .filter(channel => channel.type === 4) // Category type
      .sort((a, b) => (('position' in a ? a.position : 0) - ('position' in b ? b.position : 0)));
    
    for (const category of categories) {
      if (!('name' in category)) continue;
      
      console.log(`\n📁 ${category.name}`);
      
      // Get channels in this category and sort them
      const channels = Array.from(guild.channels.cache.values())
        .filter(channel => 'parentId' in channel && channel.parentId === category.id)
        .sort((a, b) => (('position' in a ? a.position : 0) - ('position' in b ? b.position : 0)));
      
      for (const channel of channels) {
        if ('name' in channel) {
          console.log(`  - #${channel.name} (${channel.type})`);
        }
      }
    }
    
    // List roles
    console.log('\n🎭 Roles:');
    console.log('--------');
    const roles = Array.from(guild.roles.cache.values())
      .sort((a, b) => (b.rawPosition || 0) - (a.rawPosition || 0));
    
    for (const role of roles) {
      if (role.name !== '@everyone') {
        console.log(`- @${role.name} (${role.id}) [${role.permissions.bitfield}]`);
      }
    }
    
    console.log('\n✅ Audit complete');
    
  } catch (error) {
    console.error('❌ Error during server audit:', error);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(DISCORD_TOKEN);
