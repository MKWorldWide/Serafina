import { REST, Routes, ApplicationCommand, Collection } from 'discord.js';
import { getLogger } from '../../utils/logger';
import { pingAll } from '../../services/heartbeat';
import { generateDashboardEmbed } from '../../ui/dashboard';
import { getServices } from '../../config/env';

const logger = getLogger({ service: 'operations:commands' });

// Command definitions
const commands = [
  {
    name: 'status',
    description: 'Check the status of all services',
    options: [
      {
        name: 'service',
        description: 'Specific service to check',
        type: 3, // STRING
        required: false,
        autocomplete: true
      },
      {
        name: 'ephemeral',
        description: 'Whether to show the status only to you (default: true)',
        type: 5, // BOOLEAN
        required: false
      }
    ]
  },
  {
    name: 'services',
    description: 'List all monitored services',
    options: [
      {
        name: 'category',
        description: 'Filter services by category',
        type: 3, // STRING
        required: false,
        autocomplete: true
      }
    ]
  },
  {
    name: 'whois',
    description: 'Get detailed information about a service',
    options: [
      {
        name: 'service',
        description: 'The service to get information about',
        type: 3, // STRING
        required: true,
        autocomplete: true
      }
    ]
  },
  {
    name: 'incident',
    description: 'Manage service incidents',
    options: [
      {
        name: 'action',
        description: 'Action to perform',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'Resolve', value: 'resolve' },
          { name: 'List', value: 'list' }
        ]
      },
      {
        name: 'service',
        description: 'Service name (required for create/update)', 
        type: 3, // STRING
        required: false,
        autocomplete: true
      },
      {
        name: 'severity',
        description: 'Incident severity (required for create)', 
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Minor', value: 'minor' },
          { name: 'Major', value: 'major' },
          { name: 'Critical', value: 'critical' }
        ]
      },
      {
        name: 'title',
        description: 'Incident title (required for create/update)',
        type: 3, // STRING
        required: false
      },
      {
        name: 'description',
        description: 'Incident description (required for create/update)',
        type: 3, // STRING
        required: false
      },
      {
        name: 'incident_id',
        description: 'Incident ID (required for update/resolve)',
        type: 3, // STRING
        required: false
      }
    ]
  },
  {
    name: 'dashboard',
    description: 'Show the service status dashboard',
    options: [
      {
        name: 'service',
        description: 'Show details for a specific service',
        type: 3, // STRING
        required: false,
        autocomplete: true
      },
      {
        name: 'refresh',
        description: 'Force refresh the status',
        type: 5, // BOOLEAN
        required: false
      }
    ]
  }
];

// Command handlers
const commandHandlers = new Map<string, Function>();

/**
 * Register all slash commands with Discord
 */
export async function registerCommands(client: any): Promise<void> {
  try {
    if (!process.env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN is not set');
    }
    
    if (!process.env.DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID is not set');
    }
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    // Register global commands
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    
    logger.info('Successfully registered application commands');
  } catch (error) {
    logger.error('Failed to register application commands', { error });
    throw error;
  }
}

/**
 * Handle autocomplete interactions
 */
async function handleAutocomplete(interaction: any) {
  const focusedOption = interaction.options.getFocused(true);
  
  if (focusedOption.name === 'service') {
    const services = getServices();
    const filtered = services
      .filter(service => 
        service.name.toLowerCase().includes(focusedOption.value.toLowerCase())
      )
      .slice(0, 25);
    
    await interaction.respond(
      filtered.map(service => ({
        name: service.name,
        value: service.name
      }))
    );
  } else if (focusedOption.name === 'category') {
    const services = getServices();
    const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
    const filtered = categories
      .filter((category): category is string => 
        category !== undefined && 
        category.toLowerCase().includes(focusedOption.value.toLowerCase())
      )
      .slice(0, 25);
    
    await interaction.respond(
      filtered.map(category => ({
        name: category,
        value: category
      }))
    );
  }
}

/**
 * Handle command execution
 */
export async function handleCommand(interaction: any) {
  if (interaction.isAutocomplete()) {
    return handleAutocomplete(interaction);
  }
  
  const { commandName } = interaction;
  const handler = commandHandlers.get(commandName);
  
  if (!handler) {
    logger.warn(`No handler found for command: ${commandName}`);
    return interaction.reply({
      content: 'This command is not implemented yet.',
      ephemeral: true
    });
  }
  
  try {
    await handler(interaction);
  } catch (error) {
    logger.error(`Error executing command ${commandName}`, { error });
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'An error occurred while executing this command.',
        ephemeral: true
      });
    } else if (interaction.deferred) {
      await interaction.editReply({
        content: 'An error occurred while executing this command.'
      });
    }
  }
}

// Register command handlers
commandHandlers.set('status', async (interaction: any) => {
  await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral', false) ?? true });
  
  const serviceName = interaction.options.getString('service');
  
  if (serviceName) {
    // Show status for a specific service
    const { embed, components } = await generateDashboardEmbed(serviceName);
    await interaction.editReply({ embeds: [embed], components });
  } else {
    // Show status for all services
    const { embed, components } = await generateDashboardEmbed();
    await interaction.editReply({ embeds: [embed], components });
  }
});

commandHandlers.set('dashboard', async (interaction: any) => {
  await interaction.deferReply({ ephemeral: true });
  
  const serviceName = interaction.options.getString('service');
  const refresh = interaction.options.getBoolean('refresh') ?? false;
  
  if (serviceName) {
    // Show service details
    const { embed, components } = await generateDashboardEmbed(serviceName);
    await interaction.editReply({ embeds: [embed], components });
  } else {
    // Show main dashboard
    const { embed, components } = await generateDashboardEmbed();
    await interaction.editReply({ embeds: [embed], components });
  }
});

// Add more command handlers as needed
export { commandHandlers };
