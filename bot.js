require('dotenv').config({ path: __dirname + '/.env' });
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Partials } = require('discord.js');

console.log("🚀 Starting bot...");

// Validate .env variables
if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error("❌ Error: Missing BOT_TOKEN, CLIENT_ID, or GUILD_ID in .env file.");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions // ✅ Required for reactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction] // ✅ Ensures bot can read partial messages
});

const GORDON_RAMSEY_CHANNEL_ID = "1354125805571145789"; // Replace with your text channel ID

// Register Slash Commands
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Check bot latency')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log("🔄 Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log("✅ Slash commands registered successfully!");
    } catch (error) {
        console.error("❌ Failed to register slash commands:", error);
    }
})();

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
});

// Slash Command Handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply("🏓 Pinging...");
        const sent = await interaction.fetchReply(); // Fetch the reply separately
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong! Latency: **${latency}ms** | WebSocket: **${client.ws.ping}ms**`);
    }
});

// Message Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    console.log(`📩 Message received: "${message.content}" from ${message.author.tag} in #${message.channel.name}`);

    // Handle "!ping" text command
    if (message.content.toLowerCase() === "!ping") {
        const sent = await message.reply("🏓 Pinging...");
        const latency = Date.now() - message.createdTimestamp;
        sent.edit(`🏓 Pong! Latency: **${latency}ms** | WebSocket: **${client.ws.ping}ms**`);
    }

    // Ensure bot reacts only in #gordon-ramsay channel
    if (message.channel.id !== GORDON_RAMSEY_CHANNEL_ID) return;

    // Ensure the message has an image
    if (message.attachments.size > 0) {
        let imageFound = false;
        message.attachments.forEach(attachment => {
            const url = attachment.url;
            const fileExt = url.split('.').pop().toLowerCase(); // Check file extension

            if (attachment.contentType?.startsWith('image/') || ["png", "jpg", "jpeg", "gif", "webp"].includes(fileExt)) {
                imageFound = true;
            }
        });

        if (imageFound) {
            console.log(`📷 Image detected from ${message.author.username} in #gordon-ramsay`);

            // React with rating emojis
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
            for (let emoji of emojis) {
                try {
                    await message.react(emoji);
                    console.log(`✔ Reacted with ${emoji}`);
                } catch (error) {
                    console.error(`❌ Failed to react with ${emoji}:`, error);
                }
            }
        } else {
            console.log("⚠ No valid image detected.");
        }
    }
});

// Login the bot
client.login(process.env.BOT_TOKEN)
    .then(() => console.log("✅ Bot logged in successfully."))
    .catch(error => {
        console.error("❌ Failed to login:", error);
        process.exit(1);
    });
