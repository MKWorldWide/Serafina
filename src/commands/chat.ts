import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { SerafinaPersonality } from '../core/serafina';
import { Command } from '../types/Command'; // Note: Capital 'C' in 'Command' to match file system

export const chat: Command = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Have a conversation with Serafina')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Your message to Serafina')
        .setRequired(true)
    ) as SlashCommandBuilder,
  
  execute: async (interaction: ChatInputCommandInteraction, serafina?: SerafinaPersonality) => {
    if (!serafina) {
      await interaction.reply({
        content: 'Serafina\'s personality system is not available right now.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();
    
    const message = interaction.options.getString('message', true);
    
    try {
      // Create a mock message object for the personality system
      const mockMessage = {
        ...interaction,
        content: message,
        channel: interaction.channel,
        author: interaction.user,
        reply: async (content: string) => {
          await interaction.editReply(content);
          return { content };
        }
      } as unknown as Message;
      
      // Generate a response using Serafina's personality
      const response = await serafina.generateResponse(mockMessage);
      await interaction.editReply(response);
    } catch (error) {
      console.error('Error in chat command:', error);
      await interaction.editReply({
        content: 'I encountered an error processing your message. Please try again later.'
      }).catch(console.error);
    }
  }
};
