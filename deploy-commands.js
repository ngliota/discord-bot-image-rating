require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot’s latency')
].map(command => command.toJSON());

console.log("🔄 Starting deployment...");
console.log("BOT_TOKEN Loaded:", process.env.BOT_TOKEN ? "✅ Yes" : "❌ No");
console.log("CLIENT_ID:", process.env.CLIENT_ID || "❌ Missing");
console.log("GUILD_ID:", process.env.GUILD_ID || "❌ Missing");

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
})();