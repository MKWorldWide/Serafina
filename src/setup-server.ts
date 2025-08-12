// Import types from our declarations
import type {
  ServerRoles,
  PermissionFlags,
  ChannelConfig,
  CategoryConfig
} from '@/types/discord';

// Import Discord.js with proper type and value imports
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  type Guild,
  type Role,
  type OverwriteResolvable,
  type CategoryChannel,
  type PermissionResolvable,
  type GuildChannelType
} from 'discord.js';

// Import ChannelType as a value for runtime usage
import { ChannelType } from 'discord.js';
import dotenv from 'dotenv';

// Permission overwrite type is now imported from discord.d.ts

// Load environment variables
dotenv.config();

const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// All types are now imported from discord.d.ts

// Initialize Discord client with proper intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Helper function to convert permission flags to bitfield
function convertToBitfield(permissions: PermissionFlags): bigint {
  return Object.entries(permissions).reduce((acc, [key, value]) => {
    if (value === true) {
      const flag = PermissionFlagsBits[key as keyof typeof PermissionFlagsBits];
      if (flag) {
        return (BigInt(acc) | BigInt(flag));
      }
    }
    return acc;
  }, 0n);
}

// Helper function to create channel permission overwrites with proper typing
function createPermissionOverwrites(
  guild: Guild,
  roles: ServerRoles,
  permissions: Record<string, PermissionFlags>,
  additionalPermissions: Record<string, PermissionFlags> = {}
): OverwriteResolvable[] {
  const overwrites: OverwriteResolvable[] = [];
  
  // Add everyone permissions (deny by default)
  overwrites.push({
    id: guild.roles.everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  });
  
  // Process role permissions
  for (const [roleId, perms] of Object.entries(permissions)) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      const allow = convertToBitfield(perms);
      if (allow > 0n) {
        overwrites.push({
          id: role.id,
          allow: [allow as PermissionResolvable]
        });
      }
    }
  }
  
  // Process additional permissions
  for (const [targetId, perms] of Object.entries(additionalPermissions)) {
    const target = guild.roles.cache.get(targetId) || guild.members.cache.get(targetId);
    if (target) {
      const allow = convertToBitfield(perms);
      if (allow > 0n) {
        overwrites.push({
          id: target.id,
          allow: [allow as PermissionResolvable]
        });
      }
    }
  }
  
  return overwrites;
}

// Function to ensure a role exists, or create it if it doesn't
async function ensureRole(
  guild: Guild,
  name: string,
  color: number,
  permissions: PermissionFlags
): Promise<Role> {
  let role = guild.roles.cache.find(r => r.name === name);
  
  if (!role) {
    console.log(`Creating role: ${name}`);
    role = await guild.roles.create({
      name,
      color,
      permissions: convertToBitfield(permissions),
      reason: 'Setting up server roles'
    });
  } else {
    console.log(`Updating existing role: ${name}`);
    await role.edit({
      color,
      permissions: convertToBitfield(permissions),
      reason: 'Updating server role permissions'
    });
  }
  
  return role;
}

// Function to set up server roles
async function setupRoles(guild: Guild): Promise<ServerRoles> {
  console.log('Setting up server roles...');
  
  // Define role permissions
  const adminPermissions: PermissionFlags = {
    Administrator: true
  };
  
  const moderatorPermissions: PermissionFlags = {
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
  };
  
  const memberPermissions: PermissionFlags = {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    EmbedLinks: true,
    AttachFiles: true,
    AddReactions: true
  };
  
  // Create or update roles
  const adminRole = await ensureRole(guild, 'Admin', 0x5865F2, adminPermissions);
  const moderatorRole = await ensureRole(guild, 'Moderator', 0x57F287, moderatorPermissions);
  const memberRole = await ensureRole(guild, 'Member', 0x2F3136, memberPermissions);
  
  return {
    admin: adminRole,
    moderator: moderatorRole,
    member: memberRole
  };
}

// Function to update server settings
async function updateServerSettings(guild: Guild): Promise<void> {
  console.log('Updating server settings...');
  
  try {
    // Update server name and settings
    await guild.setName('GameDin Community');
    
    // Set verification level (0-4: NONE to VERY_HIGH)
    await guild.setVerificationLevel(1); // LOW
    
    // Set explicit content filter (0-2: DISABLED to ALL_MEMBERS)
    await guild.setExplicitContentFilter(2); // ALL_MEMBERS
    
    console.log('✅ Server settings updated');
  } catch (error) {
    console.error('❌ Failed to update server settings:', error);
    throw error;
  }
}

// Function to set up categories and channels
async function setupCategoriesAndChannels(guild: Guild, roles: ServerRoles): Promise<void> {
  console.log('Setting up categories and channels...');
  
  // Define categories and their channels with proper typing
  const categories: CategoryConfig[] = [
    {
      name: '👑 Admin',
      position: 1,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: roles.admin.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages
          ]
        },
        {
          id: roles.moderator.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageMessages
          ]
        }
      ],
      channels: [
        {
          name: 'mod-logs',
          type: ChannelType.GuildText,
          topic: 'Moderation logs and actions',
          permissionOverwrites: []
        },
        {
          name: 'admin-chat',
          type: ChannelType.GuildText,
          topic: 'Private discussion for server staff',
          permissionOverwrites: []
        }
      ]
    },
    {
      name: '🎮 Game Channels',
      position: 2,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ],
      channels: [
        {
          name: 'game-discussion',
          type: ChannelType.GuildText,
          topic: 'Discuss GameDin gameplay and strategies',
          permissionOverwrites: []
        },
        {
          name: 'bug-reports',
          type: ChannelType.GuildText,
          topic: 'Report bugs and issues you encounter',
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.SendMessages]
            },
            {
              id: roles.member.id,
              allow: [PermissionFlagsBits.SendMessages]
            }
          ]
        },
        {
          name: 'looking-for-group',
          type: ChannelType.GuildText,
          topic: 'Find other players to team up with',
          permissionOverwrites: []
        }
      ]
    },
    {
      name: '👥 Community',
      position: 3,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ],
      channels: [
        {
          name: 'general',
          type: ChannelType.GuildText,
          topic: 'General discussion about GameDin',
          permissionOverwrites: []
        },
        {
          name: 'media',
          type: ChannelType.GuildText,
          topic: 'Share your GameDin screenshots and videos!',
          permissionOverwrites: []
        },
        {
          name: 'voice-chat',
          type: ChannelType.GuildVoice,
          userLimit: 10,
          permissionOverwrites: []
        }
      ]
    }
  ];

  try {
    // Create categories and channels
    for (const categoryConfig of categories) {
      console.log(`Creating category: ${categoryConfig.name}`);
      
      // Create the category
      const category = await guild.channels.create({
        name: categoryConfig.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: categoryConfig.permissionOverwrites || [],
        position: categoryConfig.position,
        reason: 'Setting up server categories'
      } as const);

      // Create channels in this category
      if (categoryConfig.channels) {
        for (const channelConfig of categoryConfig.channels) {
          console.log(`  Creating channel: ${channelConfig.name}`);
          
          // Create a properly typed channel config based on the channel type
          const commonOptions = {
            ...channelConfig,
            parent: category,
            reason: 'Setting up server channels'
          };
          
          // Remove the type from the options as it's handled by the specific create method
          const { type, ...channelOptions } = commonOptions;
          
          // Create the channel with the appropriate type
          switch (type) {
            case ChannelType.GuildText:
              await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildText
              });
              break;
              
            case ChannelType.GuildVoice:
              await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildVoice
              });
              break;
              
            default:
              console.warn(`Unsupported channel type: ${type}. Creating as text channel.`);
              await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildText
              });
          }
        }
      }
    }
    
    console.log('✅ Categories and channels created successfully');
  } catch (error) {
    console.error('❌ Failed to set up categories and channels:', error);
    throw error;
  }
}

// Main function to set up the server
async function setupServer() {
  if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting server setup...');
    
    // Log in to Discord
    await client.login(DISCORD_TOKEN);
    console.log(`✅ Logged in as ${client.user?.tag}`);

    // Get the guild (server) we want to set up
    const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
    if (!guild) {
      throw new Error(`No guild found with ID: ${DISCORD_GUILD_ID}`);
    }

    console.log(`\n🔄 Setting up server: ${guild.name} (${guild.id})`);
    
    // Set up roles
    console.log('\n🔄 Setting up roles...');
    const roles = await setupRoles(guild);
    console.log('✅ Roles set up successfully');

    // Update server settings
    console.log('\n🔄 Updating server settings...');
    await updateServerSettings(guild);
    console.log('✅ Server settings updated');

    // Set up categories and channels
    console.log('\n🔄 Setting up categories and channels...');
    await setupCategoriesAndChannels(guild, roles);
    console.log('✅ Categories and channels set up successfully');

    console.log('\n✨ Server setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during server setup:', error);
    process.exit(1);
  } finally {
    // Clean up the client
    client.destroy();
  }
}

// Handle errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Start the setup process
setupServer().catch(error => {
  console.error('❌ Fatal error during setup:', error);
  process.exit(1);
});
