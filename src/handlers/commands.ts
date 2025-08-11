import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Client, CommandInteraction } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

const commands: Command[] = [
    {
        data: new SlashCommandBuilder()
            .setName('relay')
            .setDescription('Relay a message to another service')
            .addStringOption(option =>
                option.setName('service')
                    .setDescription('Service to relay to (shadow-nexus, athena, divina)')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Shadow Nexus', value: 'shadow-nexus' },
                        { name: 'Athena', value: 'athena' },
                        { name: 'Divina', value: 'divina' }
                    )
            )
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('Message to relay')
                    .setRequired(true)
            ),
        execute: async (interaction: CommandInteraction) => {
            const service = interaction.options.get('service')?.value as string;
            const message = interaction.options.get('message')?.value as string;
            
            // Get the appropriate URL from environment variables
            const serviceUrls: Record<string, string> = {
                'shadow-nexus': process.env.SHADOW_NEXUS_URL || '',
                'athena': process.env.ATHENACORE_URL || '',
                'divina': process.env.DIVINA_URL || ''
            };

            const serviceUrl = serviceUrls[service];
            
            if (!serviceUrl) {
                await interaction.reply('❌ Service not configured');
                return;
            }

            try {
                // In a real implementation, you would make an API call here
                // const response = await fetch(`${serviceUrl}/api/relay`, {
                //     method: 'POST',
                //     body: JSON.stringify({ message }),
                //     headers: { 'Content-Type': 'application/json' }
                // });
                
                await interaction.reply(`📡 Message relayed to ${service} service`);
            } catch (error) {
                console.error('Relay error:', error);
                await interaction.reply('❌ Failed to relay message');
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('status')
            .setDescription('Check the status of connected services'),
        execute: async (interaction: CommandInteraction) => {
            await interaction.deferReply();
            
            const services = [
                { name: 'Shadow Nexus', url: process.env.SHADOW_NEXUS_URL },
                { name: 'Athena', url: process.env.ATHENACORE_URL },
                { name: 'Divina', url: process.env.DIVINA_URL }
            ];

            const statuses = await Promise.all(services.map(async (service) => {
                if (!service.url) {
                    return `❌ ${service.name}: Not configured`;
                }

                try {
                    // In a real implementation, you would check the health endpoint
                    // const response = await fetch(`${service.url}/health`);
                    // const isHealthy = response.ok;
                    const isHealthy = true; // Mock response for now
                    
                    return isHealthy 
                        ? `✅ ${service.name}: Online`
                        : `⚠️ ${service.name}: Unhealthy`;
                } catch (error) {
                    console.error(`Status check failed for ${service.name}:`, error);
                    return `❌ ${service.name}: Offline`;
                }
            }));

            await interaction.editReply({
                content: `## 🚀 Service Status\n${statuses.join('\n')}`
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('heartbeat')
            .setDescription('Check if Serafina is responsive'),
        execute: async (interaction: CommandInteraction) => {
            const heartbeat = '💓';
            const sent = await interaction.reply({ 
                content: `${heartbeat} Pong!`,
                fetchReply: true 
            });
            
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply(
                `${heartbeat} Pong! Latency: ${latency}ms`
            );
        }
    }
];

export async function registerCommands(client: Client, guildId: string) {
    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
        console.error('Missing required environment variables');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commandData = commands.map(command => command.data.toJSON());

    try {
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commandData },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

export { commands };
