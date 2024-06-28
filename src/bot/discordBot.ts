import { config } from 'dotenv';
config();

import {
  ActionRowBuilder,
  Client,
  GatewayIntentBits,
  InteractionType,
  ModalBuilder,
  Routes,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import SummaryCommand from './commands/summary'; // Import the new command
import { getUserAccessToken, getUserServerId } from '../lib/discord/discord.services';
import { User } from "../models/user.model";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => console.log(`${client.user?.tag} has logged in!`));

client.on('interactionCreate', async (interaction) => {
  // console.log('Interaction created');
  if (interaction.isChatInputCommand()) {
    // console.log('Chat Command');
    if (interaction.commandName === 'summary') {
      await SummaryCommand.execute(interaction, client);
    }
  } else if (interaction.isSelectMenu()) {
    // console.log('Select Menu');
    if (interaction.customId === 'food_options') {
      // console.log('Food options selected:', interaction.values);
    } else if (interaction.customId === 'drink_options') {
      // console.log('Drink options selected:', interaction.values);
    }
  } else if (interaction.type === InteractionType.ModalSubmit) {
    // console.log('Modal Submitted...');
    if (interaction.customId === 'registerUserModal') {
      // console.log('Register User Modal submitted with username:', interaction.fields.getTextInputValue('username'));
      await interaction.reply({
        content: 'You successfully submitted your details!',
      });
    }
  }
});

export const startDiscordBot = async (userId: string) => {
  try {
    const accessToken = await getUserAccessToken({ userId });
    const serverId = await getUserServerId({ userId });
    const rest = new REST({ version: '10' }).setToken(accessToken);

    const commands = [
      SummaryCommand.data.toJSON(), // Register the new command
    ];

    // console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, serverId), {
      body: commands,
    });
    console.log('Commands refreshed');
    await client.login(accessToken);
    // console.log('Client logged in');
  } catch (err) {
    console.error('Error during login or command refresh:', err);
  }
};

// You need to provide the userId when starting the bot
const userId = 'db079464-978c-41fe-9054-523631b158cf'; // Replace with actual user ID
startDiscordBot(userId);
