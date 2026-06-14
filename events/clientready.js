const Parser = require("rss-parser");
const parser = new Parser();

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {

    console.log(`✅ Logged in as ${client.user.tag}`);

    // =======================
    // 🎧 STATUS
    // =======================
    console.log("🎧 Bot is fully online and ready");

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

          // first run init
          if (!config.lastVideo) {
            config.lastVideo = latest.id;
            console.log(`📌 Tracking channel: ${config.youtubeChannelId}`);
            continue;
          }

          // new video detected
          if (latest.id !== config.lastVideo) {

            config.lastVideo = latest.id;

            const channel = await client.channels.fetch(config.discordChannelId).catch(() => null);
            if (!channel) return;

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
          console.error("❌ YouTube error:", err.message);
        }

      }

    }, 300000);
  }
};
