const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const express = require('express');

// 1. Initialize the Express Keep-Alive Server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Gemini AI Engine Status: ONLINE ⚡');
});

app.listen(PORT, () => {
    console.log(`Keep-alive web server initialized on port ${PORT}`);
});

// 2. Initialize the Google Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 3. Initialize the Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in securely as ${client.user.tag}!`);
});

// 4. Message Logic and AI Request Handling
client.on('messageCreate', async (message) => {
    // Ignore messages sent by bots to avoid infinite loops
    if (message.author.bot) return;

    // Trigger the bot whenever someone types !ask followed by their question
    if (message.content.startsWith('!ask ')) {
        const prompt = message.content.slice(5).trim();

        if (!prompt) {
            return message.reply('Please provide a question! Example: `!ask Why is the sky blue?`');
        }

        try {
            // Shows the "GeminiBot is typing..." status in Discord
            await message.channel.sendTyping();

            // Query the lightning-fast gemini-2.5-flash model
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const replyText = response.text;

            // Handle Discord's maximum 2000-character message limit
            if (replyText.length > 2000) {
                const chunks = replyText.match(/[\s\S]{1,2000}/g);
                for (const chunk of chunks) {
                    await message.reply(chunk);
                }
            } else {
                await message.reply(replyText);
            }

        } catch (error) {
            console.error('Gemini API Error Encountered:', error);
            await message.reply('❌ An error occurred while communicating with the Gemini AI network.');
        }
    }
});

// Log the bot in using the environment variable token
client.login(process.env.DISCORD_TOKEN);
