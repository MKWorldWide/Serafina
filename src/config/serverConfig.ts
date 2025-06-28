interface ChannelConfig {
  name: string;
  type: 'text' | 'voice';
  permissions?: {
    everyone?: {
      SendMessages?: boolean;
      ViewChannel?: boolean;
      AddReactions?: boolean;
      CreatePublicThreads?: boolean;
      CreatePrivateThreads?: boolean;
      SendMessagesInThreads?: boolean;
    };
  };
}

interface CategoryConfig {
  channels: ChannelConfig[];
}

export const SERVER_CONFIG = {
  // Server Information
  GUILD_ID: 'YOUR_GUILD_ID', // Replace with actual server ID
  
  // Channel Categories and Channels
  categories: {
    '🌀 GameDin Core': {
      channels: [
        { name: 'welcome', type: 'text' as const, permissions: { everyone: { SendMessages: false } } },
        { name: 'rules-and-purpose', type: 'text' as const, permissions: { everyone: { SendMessages: false } } },
        { name: 'introduce-yourself', type: 'text' as const },
        { name: 'announcements', type: 'text' as const, permissions: { everyone: { SendMessages: false } } },
        { name: 'role-select', type: 'text' as const }
      ]
    },
    '💬 Unity Circle': {
      channels: [
        { name: 'gaming-chat', type: 'text' as const },
        { name: 'memes-and-chaos', type: 'text' as const },
        { name: 'vent-channel', type: 'text' as const, permissions: { everyone: { AddReactions: false, CreatePublicThreads: false, CreatePrivateThreads: false, SendMessagesInThreads: false } } },
        { name: 'coven-circle', type: 'text' as const },
        { name: 'after-dark', type: 'text' as const },
        { name: 'holy-quotes', type: 'text' as const }
      ]
    },
    '🎮 Game Rooms': {
      channels: [
        { name: 'matchmaking', type: 'text' as const },
        { name: 'roblox-din', type: 'text' as const },
        { name: 'fortnite-legion', type: 'text' as const },
        { name: 'fighting-games', type: 'text' as const },
        { name: 'suggest-a-game', type: 'text' as const }
      ]
    },
    '🎥 Spotlight': {
      channels: [
        { name: 'your-streams', type: 'text' as const },
        { name: 'epic-moments', type: 'text' as const },
        { name: 'art-and-mods', type: 'text' as const }
      ]
    },
    '🔊 GameDin Voice': {
      channels: [
        { name: '🎤 General Vibe', type: 'voice' as const },
        { name: '🎮 Game Night VC', type: 'voice' as const },
        { name: '🕊️ Chill Lounge', type: 'voice' as const },
        { name: '🔒 The Throne Room', type: 'voice' as const },
        { name: '🔥 Sacred Flame VC', type: 'voice' as const }
      ]
    },
    '🛡️ Moderation': {
      channels: [
        { name: 'mod-logs', type: 'text' as const, permissions: { everyone: { ViewChannel: false } } },
        { name: 'mod-chat', type: 'text' as const, permissions: { everyone: { ViewChannel: false } } },
        { name: 'reports', type: 'text' as const, permissions: { everyone: { ViewChannel: false } } },
        { name: 'trial-moderators', type: 'text' as const, permissions: { everyone: { ViewChannel: false } } }
      ]
    }
  },

  // Roles Configuration
  roles: {
    '👑 Sovereign': {
      color: 0xFFD700,
      permissions: ['Administrator'],
      description: 'Server Owner'
    },
    '🛡️ Guardian': {
      color: 0xFF0000,
      permissions: ['ModerateMembers', 'ManageMessages', 'ManageChannels'],
      description: 'Senior Moderator'
    },
    '✨ Seraph': {
      color: 0xFF69B4,
      permissions: ['ModerateMembers', 'ManageMessages'],
      description: 'Moderator'
    },
    '🌟 Trial Seraph': {
      color: 0x9370DB,
      permissions: ['ModerateMembers'],
      description: 'Trial Moderator'
    },
    '💫 Member': {
      color: 0x00FF00,
      permissions: [],
      description: 'Regular Member'
    },
    '🎮 Gamer': {
      color: 0x4169E1,
      permissions: [],
      description: 'Active Gamer'
    },
    '🎨 Creator': {
      color: 0xFF1493,
      permissions: [],
      description: 'Content Creator'
    }
  },

  // Auto-moderation settings
  autoMod: {
    spamThreshold: 5,
    spamWindow: 5000,
    toxicWords: ['hate', 'stupid', 'dumb', 'idiot', 'kill yourself', 'kys'],
    welcomeMessages: [
      "Welcome to the divine realm of GameDin, {user}! 🌟",
      "A new star has joined our constellation, {user}! ✨",
      "The Sovereign welcomes you, {user}! May your journey be blessed! 💫",
      "Another soul joins our sacred gaming community, {user}! 🎮",
      "The gates of GameDin open for you, {user}! 🌈"
    ]
  },

  // XP and Leveling
  xp: {
    messageXp: 1,
    voiceXpPerMinute: 2,
    levelMultiplier: 100
  }
}; 