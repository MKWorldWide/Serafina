import { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, Guild, Role, OverwriteResolvable } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

// Type definitions
type PermissionFlags = {
  [K in keyof typeof PermissionFlagsBits]?: boolean;
};

interface BaseChannelConfig {
  name: string;
  type: ChannelType;
  permissionOverwrites?: OverwriteResolvable[];
}

interface TextChannelConfig extends BaseChannelConfig {
  type: ChannelType.GuildText;
  topic?: string;
  nsfw?: boolean;
  rateLimitPerUser?: number;
}

interface VoiceChannelConfig extends BaseChannelConfig {
  type: ChannelType.GuildVoice;
  userLimit?: number;
  bitrate?: number;
}

type ChannelConfig = TextChannelConfig | VoiceChannelConfig;

interface CategoryConfig {
  name: string;
  position: number;
  permissionOverwrites?: OverwriteResolvable[];
  channels?: ChannelConfig[];
}

interface ServerRoles {
  admin: Role;
  moderator: Role;
  member: Role;
}

// Helper function to convert permission flags to bitfield
function convertToBitfield(permissions: PermissionFlags): bigint {
  return Object.entries(permissions).reduce((acc, [key, value]) => {
    if (value === true) {
      const flag = PermissionFlagsBits[key as keyof typeof PermissionFlagsBits];
      if (flag) return (BigInt(acc) | BigInt(flag));
    }
    return acc;
  }, 0n);
}

// Function to ensure a role exists, or create it if it doesn't
async function ensureRole(guild: Guild, name: string, color: number, permissions: PermissionFlags): Promise<Role> {
  let role = guild.roles.cache.find(r => r.name === name);
  if (!role) {
    role = await guild.roles.create({
      name,
      color,
      permissions: convertToBitfield(permissions),
      reason: 'Server setup'
    });
  }
  return role;
}

// Set up server roles
async function setupRoles(guild: Guild): Promise<ServerRoles> {
  console.log('Setting up roles...');
  
  // Admin role with all permissions
  const adminRole = await ensureRole(guild, 'Admin', 0xff0000, {
    Administrator: true
  });

  // Moderator role with moderation permissions
  const moderatorRole = await ensureRole(guild, 'Moderator', 0x00ff00, {
    ManageMessages: true,
    KickMembers: true,
    BanMembers: true,
    MuteMembers: true,
    DeafenMembers: true,
    MoveMembers: true,
    ManageNicknames: true,
    ManageRoles: true,
    ManageChannels: true,
    ViewAuditLog: true,
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    MentionEveryone: true,
    EmbedLinks: true,
    AttachFiles: true,
    AddReactions: true
  });

  // Member role with basic permissions
  const memberRole = await ensureRole(guild, 'Member', 0x0000ff, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    EmbedLinks: true,
    AttachFiles: true,
    AddReactions: true
  });

  return { admin: adminRole, moderator: moderatorRole, member: memberRole };
}

// Set up channels and categories
async function setupChannels(guild: Guild, roles: ServerRoles) {
  console.log('Setting up channels...');
  
  // Create categories and channels
  const categories = [
    {
      name: '📢 Announcements',
      position: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.SendMessages],
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: roles.admin.id,
          allow: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]
        },
        {
          id: roles.moderator.id,
          allow: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]
        }
      ],
      channels: [
        {
          name: 'announcements',
          type: ChannelType.GuildText,
          topic: 'Official announcements from the GameDin team'
        },
        {
          name: 'updates',
          type: ChannelType.GuildText,
          topic: 'Latest updates and patch notes'
        }
      ]
    },
    {
      name: '💬 General',
      position: 1,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AddReactions
          ]
        }
      ],
      channels: [
        {
          name: 'general',
          type: ChannelType.GuildText,
          topic: 'General discussion about GameDin'
        },
        {
          name: 'voice-chat',
          type: ChannelType.GuildVoice,
          userLimit: 10
        }
      ]
    }
  ];

  // Create categories and their channels
  for (const categoryData of categories) {
    try {
      // Create category
      const category = await guild.channels.create({
        name: categoryData.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: categoryData.permissionOverwrites || [],
        position: categoryData.position,
        reason: 'Server setup: Creating category'
      });

      console.log(`✅ Created category: ${category.name}`);

      // Create channels in this category
      if (categoryData.channels && categoryData.channels.length > 0) {
        for (const channelData of categoryData.channels) {
          try {
            // Create channel based on type
            if (channelData.type === ChannelType.GuildText) {
              const textChannel = channelData as TextChannelConfig;
              await guild.channels.create({
                name: textChannel.name,
                type: ChannelType.GuildText,
                topic: textChannel.topic,
                parent: category,
                nsfw: textChannel.nsfw,
                rateLimitPerUser: textChannel.rateLimitPerUser,
                permissionOverwrites: textChannel.permissionOverwrites || [],
                reason: 'Server setup: Creating text channel'
              });
            } else if (channelData.type === ChannelType.GuildVoice) {
              const voiceChannel = channelData as VoiceChannelConfig;
              await guild.channels.create({
                name: voiceChannel.name,
                type: ChannelType.GuildVoice,
                parent: category,
                userLimit: voiceChannel.userLimit,
                bitrate: voiceChannel.bitrate,
                permissionOverwrites: voiceChannel.permissionOverwrites || [],
                reason: 'Server setup: Creating voice channel'
              });
            }
            
            console.log(`  └─ Created channel: ${channelData.name}`);
          } catch (channelError) {
            console.error(`  ❌ Failed to create channel ${channelData.name}:`, channelError);
          }
        }
      }
    } catch (categoryError) {
      console.error(`❌ Failed to create category ${categoryData.name}:`, categoryError);
    }
  }
}

// Main setup function
async function setupServer() {
  if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
    console.error('❌ Missing required environment variables');
    return;
  }

  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ] 
  });

  client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    
    try {
      const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
      if (!guild) throw new Error('Guild not found');

      console.log(`Setting up server: ${guild.name}`);
      
      // Setup roles
      const roles = await setupRoles(guild);
      
      // Setup channels
      await setupChannels(guild, roles);
      
      console.log('✅ Server setup completed!');
    } catch (error) {
      console.error('❌ Setup failed:', error);
    } finally {
      client.destroy();
    }
  });

  await client.login(DISCORD_TOKEN);
}

// Run the setup
setupServer().catch(console.error);
