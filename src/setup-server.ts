import { 
  Client, 
  GatewayIntentBits, 
  Guild, 
  Role, 
  ChannelType, 
  PermissionFlagsBits,
  PermissionResolvable,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  GuildBasedChannel,
  GuildEditOptions,
  GuildChannelCreateOptions,
  GuildChannelType,
  Locale,
  PermissionFlags,
  GuildChannelManager,
  GuildChannel
} from 'discord.js';
import dotenv from 'dotenv';

type PermissionOverwrite = {
  id: string;
  allow?: bigint | number | null;
  deny?: bigint | number | null;
  type?: 'role' | 'member' | null;
};

// Load environment variables
dotenv.config();

const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Type definitions
interface ServerRoles {
  admin: Role;
  moderator: Role;
  member: Role;
  [key: string]: Role; // Index signature for dynamic access
}

type PermissionFlags = {
  [K in keyof typeof PermissionFlagsBits]?: boolean | null | undefined;
};

interface ChannelConfig extends Omit<GuildChannelCreateOptions, 'type' | 'parent'> {
  name: string;
  type: GuildChannelType;
  parent?: string | CategoryChannel;
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  userLimit?: number;
  rateLimitPerUser?: number;
  permissionOverwrites?: OverwriteResolvable[];
  position?: number;
  reason?: string;
}

interface CategoryConfig extends Omit<GuildChannelCreateOptions, 'type'> {
  name: string;
  type?: GuildChannelType.GuildCategory;
  permissionOverwrites?: OverwriteResolvable[];
  position?: number;
  reason?: string;
  channels?: ChannelConfig[];
}

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

// Helper function to create channel permission overwrites
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
  const adminRole = await ensureRole(guild, 'Admin', 0xff0000, adminPermissions);
  const moderatorRole = await ensureRole(guild, 'Moderator', 0x00ff00, moderatorPermissions);
  const memberRole = await ensureRole(guild, 'Member', 0x0000ff, memberPermissions);
  
  return { admin: adminRole, moderator: moderatorRole, member: memberRole };
}

// Function to update server settings
async function updateServerSettings(guild: Guild): Promise<void> {
  try {
    console.log('Updating server settings...');
    
    await guild.edit({
      name: 'GameDin Community',
      verificationLevel: 1, // Low verification level
      defaultMessageNotifications: 1, // Only @mentions
      explicitContentFilter: 1, // Scan messages from all members
      afkTimeout: 300, // 5 minutes
      preferredLocale: 'en-US' as Locale,
      description: 'Welcome to the official GameDin Discord server!',
      reason: 'Setting up server with default configuration'
    });
    
    console.log('✅ Server settings updated');
  } catch (error) {
    console.error('❌ Failed to update server settings:', error);
    throw error;
  }
}

// Function to set up categories and channels
async function setupCategoriesAndChannels(guild: Guild, roles: ServerRoles): Promise<void> {
  try {
    console.log('Setting up categories and channels...');
    
    // Define categories and their channels
    const categories: CategoryConfig[] = [
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
            topic: 'Official announcements from the GameDin team',
            permissionOverwrites: []
          },
          {
            name: 'updates',
            type: ChannelType.GuildText,
            topic: 'Latest updates and patch notes',
            permissionOverwrites: []
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
        name: '⚙️ Admin',
        position: 3,
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
      }
    ];

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
      });

      // Create channels in this category
      if (categoryConfig.channels) {
        for (const channelConfig of categoryConfig.channels) {
          console.log(`  Creating channel: ${channelConfig.name}`);
          
          await guild.channels.create({
            ...channelConfig,
            parent: category,
            reason: 'Setting up server channels'
          });
        }
      }
    }
    
    console.log('✅ Categories and channels created');
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
      // Get the guild (server) we want to set up
      const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
      if (!guild) {
        throw new Error(`No guild found with ID: ${DISCORD_GUILD_ID}`);
      }

      console.log(`Setting up server: ${guild.name} (${guild.id})`);
      
      // 1. Set up server settings
      console.log('\n=== Updating Server Settings ===');
      await updateServerSettings(guild);
      
      // 2. Create or update roles
      console.log('\n=== Setting Up Roles ===');
      const roles = await setupRoles(guild);
      
      // 3. Create categories and channels
      console.log('\n=== Setting Up Categories and Channels ===');
      await setupCategoriesAndChannels(guild, roles);
      
      console.log('\n✅ Server setup completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error setting up server:', error);
      process.exit(1);
    } finally {
      client.destroy();
    }
  });

  // Handle errors
  client.on('error', (error) => {
    console.error('Discord client error:', error);
    process.exit(1);
  });

  // Log in to Discord with the bot token
  await client.login(DISCORD_TOKEN);
}

// Function to update server settings
async function updateServerSettings(guild: Guild) {
  try {
    // Define the server configuration
    const serverConfig = {
      name: 'GameDin Community',
      verificationLevel: 1, // Low verification level
      defaultMessageNotifications: 1, // Only @mentions
      explicitContentFilter: 1, // Scan messages from all members
      afkTimeout: 300, // 5 minutes
      preferredLocale: 'en-US',
      description: 'Welcome to the official GameDin Discord server!',
    };

    // Update the server settings
    await guild.edit(serverConfig);
    console.log('✅ Updated server settings');
  } catch (error) {
    console.error('❌ Error updating server settings:', error);
    throw error;
  }
}

// Function to set up categories and channels
async function setupCategoriesAndChannels(guild: Guild, roles: ServerRoles) {
  try {
    // Define categories and their channels
    const categories = [
      {
        name: '📢 Announcements',
        position: 0,
        permissionOverwrites: createPermissionOverwrites(
          guild,
          roles,
          {
            [roles.admin.id]: { ViewChannel: true, SendMessages: true, ManageMessages: true },
            [roles.moderator.id]: { ViewChannel: true, SendMessages: true, ManageMessages: true },
            [roles.member.id]: { ViewChannel: true, SendMessages: false },
          }
        ),
        channels: [
          {
            name: 'announcements',
            type: ChannelType.GuildText,
            topic: 'Official announcements from the GameDin team',
            permissionOverwrites: []
          }
        ]
      },
      // Add more categories as needed
    ];

    // Create categories and channels
    for (const categoryConfig of categories) {
      // Create the category
      const category = await guild.channels.create({
        name: categoryConfig.name,
        type: ChannelType.GuildCategory,
        position: categoryConfig.position,
        permissionOverwrites: categoryConfig.permissionOverwrites,
      });

      console.log(`✅ Created category: ${category.name}`);

      // Create channels in this category
      for (const channelConfig of categoryConfig.channels) {
        await guild.channels.create({
          ...channelConfig,
          parent: category,
        });
        console.log(`  └─ Created channel: ${channelConfig.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error setting up categories and channels:', error);
    throw error;
  }
}

// Start the setup process
setupServer().catch(error => {
  console.error('❌ Fatal error during setup:', error);
  process.exit(1);
});
  }
});

async function cleanupExistingSetup(guild: Guild) {
  console.log('\n🧹 Cleaning up existing setup...');
  
  // Delete all channels except the ones we want to keep
  const channels = guild.channels.cache;
  for (const [id, channel] of channels) {
    try {
      // Skip system channels and channels we want to keep
      if (channel?.type === ChannelType.GuildCategory || 
          channel?.type === ChannelType.GuildVoice || 
          channel?.type === ChannelType.GuildText ||
          channel?.type === ChannelType.GuildAnnouncement) {
        await channel.delete('Setting up new server structure');
      }
    } catch (error) {
      console.warn(`⚠️ Could not delete channel ${channel?.name}:`, error);
    }
  }
  
  // Delete all non-essential roles
  for (const [id, role] of guild.roles.cache) {
    try {
      if (!role.managed && role.name !== '@everyone') {
        await role.delete('Cleaning up old roles');
        console.log(`Deleted role: ${role.name}`);
      }
    } catch (error) {
      console.error(`Failed to delete role ${role.name}:`, error);
    }
  }
  
  console.log('✅ Cleanup completed');
}

  
  if (!role) {
    console.log(`Creating role: ${name}`);
    try {
      role = await guild.roles.create({
        name,
        color,
        permissions: permissions.reduce((a, b) => a | b, 0n),
        reason: 'Setting up server roles'
      });
    } catch (error) {
      console.error(`Failed to create role ${name}:`, error);
      throw error;
    }
  } else {
    // Update existing role with correct permissions
    try {
      await role.setPermissions(permissions.reduce((a, b) => a | b, 0n), 'Updating role permissions');
      await role.setColor(color, 'Updating role color');
      console.log(`Updated role: ${name}`);
    } catch (error) {
      console.error(`Failed to update role ${name}:`, error);
      throw error;
    }
  }
  
  if (!role) {
    throw new Error(`Failed to create or update role: ${name}`);
  }
  
  return role;
}

async function setupRoles(guild: Guild) {
  console.log('\n🔄 Setting up roles...');
  
  // Create or get roles
  const adminRole = await ensureRole(guild, 'Admin', 0xFF0000, [
    PermissionFlagsBits.Administrator
  ]);
  
  const moderatorRole = await ensureRole(guild, 'Moderator', 0x00FF00, [
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageChannels
  ]);
  
  const memberRole = await ensureRole(guild, 'Member', 0x0000FF, [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak
  ]);
  
  if (!adminRole || !moderatorRole || !memberRole) {
    throw new Error('Failed to create required roles');
  }
  
  const roles: ServerRoles = {
    admin: adminRole,
    moderator: moderatorRole,
    member: memberRole
  };

  console.log('✅ Roles created/updated');
  return roles;
}

// Type for permission overwrite options with proper typing
type PermissionOverwrite = {
  id: string;
  allow?: bigint | number | null | undefined;
  deny?: bigint | number | null | undefined;
  type?: OverwriteType | null | undefined;
};

// Type for permission flags
type PermissionFlags = {
  [key: string]: boolean | null | undefined;
};

// Helper function to convert permission flags to bitfield
function convertToBitfield(permissions: PermissionFlags): bigint {
  return Object.entries(permissions).reduce((acc, [key, value]) => {
    if (value === true) {
      const flag = PermissionFlagsBits[key as keyof typeof PermissionFlagsBits];
      if (flag) {
        return acc | flag;
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
): PermissionOverwrite[] {
  const overwrites: PermissionOverwrite[] = [];
  
  // Add everyone permissions (deny by default)
  overwrites.push({
    id: guild.roles.everyone.id,
    deny: PermissionFlagsBits.ViewChannel
  });
  
  // Process role permissions
  for (const [roleId, perms] of Object.entries(permissions)) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      const allow = convertToBitfield(perms);
      if (allow > 0n) {
        overwrites.push({
          id: role.id,
          allow
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
          allow
        });
      }
    }
  }
  
  return overwrites;
}

async function setupCategoriesAndChannels(guild: Guild, roles: ServerRoles) {
  console.log('\n🔄 Setting up categories and channels...');
  
  // Define categories and their channels with proper typing
  interface CategoryConfig {
    name: string;
    permissions: Record<string, PermissionOverwriteOptions>;
    channels: Array<{
      name: string;
      type: ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.GuildAnnouncement;
      topic?: string;
      permissions?: Record<string, PermissionOverwriteOptions>;
    }>;
  }
  
  const categories: CategoryConfig[] = [
    {
      name: 'ADMIN',
      permissions: {
        [roles.admin.id]: { ViewChannel: true },
        [roles.moderator.id]: { ViewChannel: true },
        [roles.member.id]: { ViewChannel: false }
      },
      channels: [
        { name: 'admin-only', type: ChannelType.GuildText, topic: 'Admin only channel' }
      ]
    },
    {
      name: 'MODERATION',
      permissions: {
        [roles.admin.id]: { ViewChannel: true },
        [roles.moderator.id]: { ViewChannel: true },
        [roles.member.id]: { ViewChannel: false }
      },
      channels: [
        { name: 'mod-logs', type: ChannelType.GuildText, topic: 'Moderation logs' },
        { name: 'reports', type: ChannelType.GuildText, topic: 'User reports' }
      ]
    },
    {
      name: 'GENERAL',
      permissions: {
        [roles.admin.id]: { ViewChannel: true, SendMessages: true },
        [roles.moderator.id]: { ViewChannel: true, SendMessages: true },
        [roles.member.id]: { ViewChannel: true, SendMessages: true }
      },
      channels: [
        { name: 'welcome', type: ChannelType.GuildText, topic: 'Welcome to our server!' },
        { name: 'announcements', type: ChannelType.GuildAnnouncement, topic: 'Server announcements' },
        { name: 'rules', type: ChannelType.GuildText, topic: 'Server rules and guidelines' },
        { name: 'general', type: ChannelType.GuildText, topic: 'General discussion' },
        { name: 'introductions', type: ChannelType.GuildText, topic: 'Introduce yourself!' },
        { 
          name: 'off-topic', 
          type: ChannelType.GuildText,
          topic: 'Off-topic discussions',
          permissions: {
            [roles.member.id]: { SendMessages: true, AddReactions: true }
          }
        }
      ]
    },
    {
      name: 'VOICE CHANNELS',
      permissions: {
        [roles.admin.id]: { 
          ViewChannel: true, 
          Connect: true, 
          Speak: true 
        },
        [roles.moderator.id]: { 
          ViewChannel: true, 
          Connect: true, 
          Speak: true 
        },
        [roles.member.id]: { 
          ViewChannel: true, 
          Connect: true, 
          Speak: true 
        }
      },
      channels: [
        { name: 'General', type: ChannelType.GuildVoice, topic: 'General voice chat' },
        { name: 'Gaming', type: ChannelType.GuildVoice, topic: 'Gaming voice chat' },
        { name: 'AFK', type: ChannelType.GuildVoice, topic: 'AFK Channel' }
          permissions: {
            ...everyonePermissions,
            [roles.member.id]: { ViewChannel: true, Connect: true, Speak: true },
          }
        }
      ]
    }
  ];
  
  // Create categories and channels
  for (const categoryConfig of categories) {
    try {
      console.log(`\n🔄 Creating category: ${categoryConfig.name}`);
      
      // Create category with proper permission overwrites
      const categoryOverwrites = createPermissionOverwrites(
        guild,
        roles,
        categoryConfig.permissions
      );
      
      const category = await guild.channels.create({
        name: categoryConfig.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: categoryOverwrites
      });
      
      console.log(`✅ Created category: ${category.name}`);

      // Create channels in this category
      for (const channelConfig of categoryConfig.channels) {
        try {
          console.log(`  Creating channel: ${channelConfig.name}`);
          
          // Combine category permissions with any channel-specific permissions
          const channelOverwrites = createPermissionOverwrites(
            guild,
            roles,
            categoryConfig.permissions,
            channelConfig.permissions || {}
          );
          
          // Common channel options
          const channelOptions = {
            name: channelConfig.name,
            topic: channelConfig.topic || '',
            parent: category,
            permissionOverwrites: channelOverwrites,
          };
          
          // Create the appropriate channel type
          let channel;
          switch (channelConfig.type) {
            case ChannelType.GuildAnnouncement:
              channel = await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildAnnouncement
              });
              break;
              
            case ChannelType.GuildVoice:
              channel = await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildVoice
              });
              break;
              
            case ChannelType.GuildText:
            default:
              channel = await guild.channels.create({
                ...channelOptions,
                type: ChannelType.GuildText
              });
          }
          
          console.log(`  └─ Created channel: ${channel.name} (${ChannelType[channel.type]})`);
        } catch (error) {
          console.error(`  ❌ Failed to create channel ${channelConfig.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create category ${categoryConfig.name}:`, error);
      
      console.log(`  └─ Created channel: ${channelConfig.name} (${ChannelType[channelConfig.type]})`);
    }
  }
  
  console.log('✅ Categories and channels created with proper permissions');
}

async function updateServerSettings(guild: Guild) {
  console.log('\n🔄 Updating server settings...');
  
  try {
    // Update server name and settings
    await guild.setName('GameDin Community');
    
    // Set verification level (0-4: NONE to VERY_HIGH)
    await guild.setVerificationLevel(1); // LOW
    
    // Set explicit content filter (0-2: DISABLED to ALL_MEMBERS)
    await guild.setExplicitContentFilter(2); // ALL_MEMBERS
    
    // Set system channel for welcome messages
    const welcomeChannel = guild.channels.cache.find(
      (c): c is TextChannel => 
        'name' in c && 
        c.name === 'welcome' && 
        c.type === ChannelType.GuildText
    );
    
    if (welcomeChannel) {
      await guild.setSystemChannel(welcomeChannel, 'Setting welcome channel')
        .then(() => console.log(`Set system channel to: ${welcomeChannel.name}`))
        .catch(err => console.error('Error setting system channel:', err));
    } else {
      console.warn('Warning: Could not find welcome channel to set as system channel');
    }
    
    // Set rules channel if it exists
    const rulesChannel = guild.channels.cache.find(
      (c): c is TextChannel => 
        'name' in c && 
        c.name === 'rules' && 
        c.type === ChannelType.GuildText
    );
    
    if (rulesChannel) {
      await guild.setRulesChannel(rulesChannel, 'Setting rules channel')
        .then(() => console.log(`Set rules channel to: ${rulesChannel.name}`))
        .catch(err => console.error('Error setting rules channel:', err));
    } else {
      console.warn('Warning: Could not find rules channel to set as rules channel');
    }
    
    // Set AFK channel if it exists
    const afkChannel = guild.channels.cache.find(
      (c): c is VoiceChannel => 
        'name' in c && 
        c.name === 'AFK' && 
        c.type === ChannelType.GuildVoice
    );
    
    if (afkChannel) {
      await guild.setAFKChannel(afkChannel, 'Setting AFK channel')
        .then(() => console.log(`Set AFK channel to: ${afkChannel.name}`))
        .catch(err => console.error('Error setting AFK channel:', err));
    } else {
      console.warn('Warning: Could not find AFK channel to set as AFK channel');
    }
    
    console.log('✅ Server settings updated');
  } catch (error) {
    console.error('❌ Failed to update server settings:', error);
    throw error;
  }
}

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);

// Handle errors
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);});
