import { ChatInputCommandInteraction, Client, CommandInteraction, SlashCommandBuilder } from 'discord.js';

const SummaryCommand = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Summarizes the last 10 messages in the channel'),

  async execute(interaction: CommandInteraction, client: Client) {
    if (!interaction.isChatInputCommand()) return;

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) {
      await interaction.reply('This command can only be used in text channels.');
      return;
    }

    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      const messageContent = messages.map(msg => msg.content).join('\n');

      // Here you would call a function to generate the summary.
      // For simplicity, we are just returning the collected messages.
      const summary = generateSummary(messageContent); // You will need to implement generateSummary.

      await interaction.reply(`Summary of the last 10 messages:\n${summary}`);
    } catch (error) {
      console.error('Error fetching messages: ', error);
      await interaction.reply('There was an error while fetching the messages.');
    }
  }
};

function generateSummary(messages: string): string {
  // Placeholder for actual summary logic.
  // Implement your summary generation logic here.
  return messages; // For now, just return the raw messages.
}

export default SummaryCommand;
