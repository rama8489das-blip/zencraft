require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

// 🔥 CLIENT SETUP
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 💾 STORAGE
client.commands = new Collection();
client.giveaways = new Map();
client.polls = new Map();

// =======================
// ✅ LOAD COMMANDS
// =======================
if (fs.existsSync('./commands')) {
  fs.readdirSync('./commands').forEach(file => {
    try {
      const cmd = require(`./commands/${file}`);

      if (!cmd.data || !cmd.execute) {
        console.log(`❌ Skipping ${file}`);
        return;
      }

      client.commands.set(cmd.data.name, cmd);
      console.log(`✅ Loaded command: ${file}`);

    } catch (err) {
      console.error(`❌ Command error (${file}):`, err.message);
    }
  });
}

// =======================
// ✅ LOAD EVENTS
// =======================
if (fs.existsSync('./events')) {
  fs.readdirSync('./events').forEach(file => {
    try {
      const ev = require(`./events/${file}`);

      if (!ev.name || !ev.execute) {
        console.log(`❌ Skipping ${file}`);
        return;
      }

      client.on(ev.name, (...args) => ev.execute(...args, client));
      console.log(`✅ Loaded event: ${file}`);

    } catch (err) {
      console.error(`❌ Event error (${file}):`, err.message);
    }
  });
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

    // 🚫 Prevent spam on restart
    if (!lastVideo) {
      lastVideo = latest.id;
      return;
    }

    if (latest.id !== lastVideo) {
      lastVideo = latest.id;

      const channel = await client.channels.fetch(process.env.YT_CHANNEL).catch(() => null);

      if (!channel) {
        console.log("❌ YT channel not found");
        return;
      }

      const videoId = latest.id.split(':').pop();

      const embed = new EmbedBuilder()
        .setTitle("📺 New Video Uploaded!")
        .setColor("#FF0000")
        .setDescription(`🎬 **${latest.title}**\n\n👉 [Watch Now](${latest.link})`)
        .setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
        .setFooter({ text: "🔥 Powered by Zencraft SMP" })
        .setTimestamp();

      await channel.send({
        content: "@everyone 🚨 NEW VIDEO!",
        embeds: [embed]
      });

      console.log("✅ YouTube notification sent");
    }

  } catch (err) {
    console.error("❌ YouTube error:", err.message);
  }
}, 300000); // 5 min

// =======================
// 🔥 READY EVENT
// =======================
client.once('ready', () => {
  console.log(`🚀 ${client.user.tag} is ONLINE`);
});

// =======================
// 🚀 LOGIN
// =======================
client.login(process.env.TOKEN)
  .catch(err => console.error("❌ Login failed:", err.message));

