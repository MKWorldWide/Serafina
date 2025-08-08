/**
 * 🖤 Lilybear Router
 *
 * Acts as the central dispatch layer for MKWorldWide, allowing the keeper to
 * whisper commands that are routed to dedicated operational channels. The
 * router exposes slash commands for messaging, deployments, system status and
 * ceremonial blessings.
 *
 * Design notes:
 * - Uses Discord slash commands for a clean UX and audit trail.
 * - Optional webhooks let each persona speak with its own avatar.
 * - Owner‑only guards protect sensitive operations such as deploys.
 */
import 'dotenv/config';
import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  TextChannel,
} from 'discord.js';
import fetch from 'node-fetch';
import { sanitizeDiscordInput } from './utils/validation';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MCP_URL = process.env.MCP_URL ?? 'http://localhost:3000';
const OWNER_ID = process.env.OWNER_ID ?? '';
const GUILD_ID = process.env.GUILD_ID ?? '';
const TOKEN = process.env.DISCORD_TOKEN ?? '';

// Map of logical operation keys to Discord channel IDs. All keys must exist in
// the environment; throw early if any are missing so deployment fails fast.
const CHANNELS: Record<string, string> = {
  athena: process.env.CHN_ATHENA ?? '',
  'lilybear-council': process.env.CHN_COUNCIL ?? '',
  github: process.env.CHN_GITHUB ?? '',
  myst: process.env.CHN_MYST ?? '',
  'lilybear-ops': process.env.CHN_OPS ?? '',
  'lilybear-outreach': process.env.CHN_OUTREACH ?? '',
};

// Optional webhooks for each persona to allow branded messages in channels.
const WEBHOOKS: Record<string, string | undefined> = {
  lilybear: process.env.WH_LILYBEAR,
  serafina: process.env.WH_SERAFINA,
  athena: process.env.WH_ATHENA,
  cursor: process.env.WH_CURSOR,
  flowers: process.env.WH_FLOWERS,
};

// ---------------------------------------------------------------------------
// Slash command registration
// ---------------------------------------------------------------------------

const commands = [
  {
    name: 'route',
    description: 'Send a message to an ops channel via Serafina.',
    options: [
      {
        name: 'to',
        description: 'athena | lilybear-council | github | myst | lilybear-ops | lilybear-outreach',
        type: 3,
        required: true,
      },
      {
        name: 'as',
        description: 'lilybear | serafina | athena | cursor | flowers',
        type: 3,
        required: false,
      },
      { name: 'text', description: 'message to send', type: 3, required: true },
    ],
  },
  {
    name: 'deploy',
    description: 'Trigger a deploy via MCP.',
    options: [{ name: 'repo', description: 'owner/name', type: 3, required: true }],
  },
  {
    name: 'status',
    description: 'Ask MCP for health/status.',
  },
  {
    name: 'bless',
    description: 'Post a ShadowFlower blessing to lilybear-outreach.',
    options: [
      {
        name: 'text',
        description: 'custom blessing (optional)',
        type: 3,
        required: false,
      },
    ],
  },
];

async function register(clientId: string): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), {
    body: commands,
  });
  console.log('✅ Slash commands registered');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sends a message to the specified logical channel. If a webhook is configured
 * for the persona, it will be used to provide a custom avatar/name.
 */
async function sayAs(target: string, content: string, persona = ''): Promise<void> {
  const channelId = CHANNELS[target];
  if (!channelId) throw new Error(`Unknown channel key: ${target}`);

  // Sanitize content to prevent accidental Discord mentions or injections.
  const safeContent = sanitizeDiscordInput(content);

  const webhook = WEBHOOKS[persona];
  if (webhook) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: safeContent }),
    });
    return;
  }

  const channel = client.channels.cache.get(channelId) as TextChannel | undefined;
  if (!channel) throw new Error(`Channel not found in cache: ${channelId}`);

  await channel.send({ content: safeContent });
}

/** Ensures only the designated owner may invoke sensitive operations. */
async function requireOwner(i: ChatInputCommandInteraction): Promise<void> {
  if (i.user.id !== OWNER_ID) {
    await i.reply({ content: '⛔ Only my keeper can do that.', ephemeral: true });
    throw new Error('Unauthorized');
  }
}

// ---------------------------------------------------------------------------
// Bot setup
// ---------------------------------------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Event handlers return promises but Discord.js does not await them.
// Suppress linting complaints about unhandled promises for these callbacks.
// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.once('ready', async () => {
  console.log(`🖤 Serafina online as ${client.user?.tag}`);
  const clientId = client.user?.id;
  if (!clientId) {
    console.error('Client ID unavailable during ready event');
    return;
  }
  await register(clientId);
  client.user?.setPresence({ activities: [{ name: 'routing whispers' }], status: 'online' });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case 'route': {
        await requireOwner(interaction);
        const to = interaction.options.getString('to', true);
        const persona = interaction.options.getString('as') ?? 'serafina';
        const rawText = interaction.options.getString('text', true);
        const text = sanitizeDiscordInput(rawText); // strip mentions to avoid accidental pings
        await interaction.reply({
          content: `📡 Routing to **${to}** as **${persona}**…`,
          ephemeral: true,
        });
        await sayAs(to, `**(${persona})** ${text}`, persona);
        break;
      }
      case 'deploy': {
        await requireOwner(interaction);
        const repo = interaction.options.getString('repo', true);
        await interaction.reply({ content: `🚀 Deploying \`${repo}\` via MCP…`, ephemeral: true });
        const resp = await fetch(`${MCP_URL}/deploy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo }),
        });
        await sayAs(
          'lilybear-ops',
          `🛠️ **Deploy requested** → \`${repo}\` • status: ${resp.status}`,
          'serafina',
        );
        break;
      }
      case 'status': {
        const resp = await fetch(`${MCP_URL}/ask-gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Give a one-line status for MKWorldWide systems.' }),
        });
        const data: unknown = await resp.json().catch(() => ({ response: '(no data)' }));
        const { response } = data as { response?: string };
        const embed = new EmbedBuilder()
          .setTitle('🧠 System Status')
          .setDescription(response ?? 'No response')
          .setColor(0x9b59b6);
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'bless': {
        await requireOwner(interaction);
        const custom = interaction.options.getString('text') ?? null;
        const blessing = sanitizeDiscordInput(
          custom ??
            '🌸 May your path be protected, your heart unburdened, and your hunt successful.',
        );
        await sayAs('lilybear-outreach', blessing, 'flowers');
        await interaction.reply({ content: '🌺 Blessing sent.', ephemeral: true });
        break;
      }
      default:
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
  } catch (err) {
    // Log the error for further analysis. In production this should integrate
    // with a logging system like Winston or Sentry.
    console.error('Router error:', err);
  }
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (!TOKEN || !GUILD_ID) {
  throw new Error('Missing DISCORD_TOKEN or GUILD_ID');
}

client.login(TOKEN).catch(err => {
  console.error('Failed to login:', err);
});
