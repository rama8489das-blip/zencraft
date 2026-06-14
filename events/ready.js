const Parser = require("rss-parser");
const parser = new Parser();
const { useMainPlayer } = require("discord-player");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {

    console.log(`✅ Logged in as ${client.user.tag}`);

    // =======================
    // 🎵 MUSIC SYSTEM (FIXED)
    // =======================

    try {
      useMainPlayer(client);
      console.log("🎵 Music System Loaded");
    } catch (err) {
      console.error("❌ Music system failed:", err);
    }

    // =======================
    // 🎧 24/7 VOICE (OPTIONAL - KEEP SIMPLE)
    // =======================

    try {
      const guild = client.guilds.cache.get("1467154652960391427");
      const voiceChannel = guild?.channels.cache.get("1515618842125275258");

      if (voiceChannel) {
        console.log("🎧 24/7 voice channel detected (no auto join handled here)");
      }
    } catch (err) {
      console.error("❌ Voice setup error:", err);
    }

    // =======================
    // 📺 YOUTUBE TRACKER
    // =======================

    const channels = [
      {
        youtubeChannelId: "UCQzpWfAHyxGg1jMfrCIxOdQ",
        discordChannelId: "1515615450484969562",
        lastVideo: null,
      },
      {
        youtubeChannelId: "UCiW_QpPfZ8E6tMjptUys3Bg",
        discordChannelId: "1515615450484969562",
        lastVideo: null,
      },
    ];

    setInterval(async () => {

      for (const config of channels) {

        try {

          const feed = await parser.parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${config.youtubeChannelId}`
          );

          if (!feed.items?.length) continue;

          const latest = feed.items[0];

          if (!config.lastVideo) {
            config.lastVideo = latest.id;
            console.log(`📌 Tracking ${config.youtubeChannelId}`);
            continue;
          }

          if (latest.id !== config.lastVideo) {

            config.lastVideo = latest.id;

            const channel = await client.channels.fetch(config.discordChannelId);

            if (!channel) continue;

            const videoId = latest.id.split(":")[2];

            await channel.send({
              content: "@everyone 🚨 NEW VIDEO!",
              embeds: [
                {
                  title: "📺 New Video Uploaded!",
                  description: `🎬 **${latest.title}**\n\n👉 [Watch Now](${latest.link})`,
                  color: 0xff0000,
                  url: latest.link,
                  image: {
                    url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  },
                  footer: { text: "🔥 Powered by Zencraft" },
                  timestamp: new Date().toISOString()
                }
              ]
            });

            console.log(`✅ Sent alert: ${latest.title}`);
          }

        } catch (err) {
          console.error(`❌ YouTube error:`, err.message);
        }

      }

    }, 300000);

  }
};
