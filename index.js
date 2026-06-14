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
const Parser = require('rss-parser');
const express = require('express');

// =======================
// 🌐 EXPRESS SERVER
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
client.giveaways = new Map();
client.polls = new Map();

// =======================
// 📦 RSS PARSER
// =======================
const parser = new Parser();

// =======================
// ✅ LOAD COMMANDS
// =======================
if (fs.existsSync('./commands')) {

  const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {

    try {

      const command = require(`./commands/${file}`);

      if (!command.data || !command.execute) {

        console.log(`❌ Invalid command: ${file}`);
        continue;

      }

      client.commands.set(command.data.name, command);

      console.log(`✅ Loaded command: ${command.data.name}`);

    } catch (err) {

      console.error(`❌ Error loading ${file}:`, err);

    }
  }
}

// =======================
// ✅ LOAD EVENTS
// =======================
if (fs.existsSync('./events')) {

  const eventFiles = fs.readdirSync('./events')
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {

    try {

      const event = require(`./events/${file}`);

      if (!event.name || !event.execute) {

        console.log(`❌ Invalid event: ${file}`);
        continue;

      }

      if (event.once) {

        client.once(event.name, (...args) =>
          event.execute(...args, client)
        );

      } else {

        client.on(event.name, (...args) =>
          event.execute(...args, client)
        );

      }

      console.log(`✅ Loaded event: ${event.name}`);

    } catch (err) {

      console.error(`❌ Error loading ${file}:`, err);

    }
  }
}

// =======================
// 🔥 YOUTUBE SYSTEM
// =======================
let lastVideo = null;

setInterval(async () => {

  try {

    const feed = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`
    );

    if (!feed.items.length) return;

    const latest = feed.items[0];

    // Prevent duplicate on restart
    if (!lastVideo) {

      lastVideo = latest.id;
      return;

    }

    if (latest.id !== lastVideo) {

      lastVideo = latest.id;

      const channel = await client.channels
        .fetch(process.env.YT_CHANNEL)
        .catch(() => null);

      if (!channel) {

        console.log('❌ YouTube channel not found');
        return;

      }

      const videoId = latest.id.split(':').pop();

      const embed = new EmbedBuilder()
        .setTitle('📺 New Video Uploaded!')
        .setColor('#ff0000')
        .setDescription(
          `🎬 **${latest.title}**\n\n👉 [Watch Now](${latest.link})`
        )
        .setImage(
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        )
        .setFooter({
          text: '🔥 Powered by Zencraft SMP'
        })
        .setTimestamp();

      await channel.send({
        content: '@everyone 🚨 NEW VIDEO!',
        embeds: [embed]
      });

      console.log('✅ YouTube notification sent');

    }

  } catch (err) {

    console.error('❌ YouTube Error:', err.message);

  }

}, 300000);

// =======================
// 🚀 LOGIN
// =======================
client.login(process.env.TOKEN)
  .catch(err => {

    console.error('❌ Login failed:', err);

  });
