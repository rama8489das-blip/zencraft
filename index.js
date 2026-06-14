require('dotenv').config();

// =======================
// 📦 IMPORTS
// =======================
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const express = require('express');

// =======================
// 🌐 EXPRESS SERVER (Render keep-alive)
// =======================
const app = express();

app.get('/', (req, res) => {
  res.send('ZENCRAFT BOT IS ALIVE ✔');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// =======================
// 🔥 DISCORD CLIENT
// =======================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// =======================
// 💾 STORAGE
// =======================
client.commands = new Collection();

// =======================
// 🎵 DISCORD PLAYER (FIXED)
// =======================
const { Player } = require('discord-player');

client.player = new Player(client);

// Load extractors (IMPORTANT)
(async () => {
  try {
    await client.player.extractors.loadDefault();
    console.log('🎵 Extractors loaded');
  } catch (err) {
    console.error('❌ Extractor load error:', err);
  }
})();

// =======================
// 🎧 PLAYER EVENTS (DEBUG)
// =======================
client.player.events.on('playerStart', (queue, track) => {
  console.log(`▶️ Now Playing: ${track.title}`);
});

client.player.events.on('playerError', (queue, error) => {
  console.error('❌ Player Error:', error);
});

client.player.events.on('connectionError', (queue, error) => {
  console.error('❌ Voice Connection Error:', error);
});

// =======================
// 📦 LOAD COMMANDS
// =======================
if (fs.existsSync('./commands')) {
  const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (!command.data || !command.execute) continue;

    client.commands.set(command.data.name, command);
    console.log(`✅ Loaded command: ${command.data.name}`);
  }
}

// =======================
// 🚀 LOGIN
// =======================
client.login(process.env.TOKEN)
  .then(() => console.log(`✅ Logged in as ${client.user.tag}`))
  .catch(err => console.error('❌ Login failed:', err));
