const Parser = require("rss-parser");
const parser = new Parser();

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // YouTube → Discord channel mappings
    const channels = [
      {
        youtubeChannelId: "UCQzpWfAHyxGg1jMfrCIxOdQ",
        discordChannelId: "1467154654252105870",
        lastVideo: null,
      },
      {
        youtubeChannelId: "UCiW_QpPfZ8E6tMjptUys3Bg",
        discordChannelId: "1497533349777117364",
        lastVideo: null,
      },
    ];

    setInterval(async () => {
      for (const config of channels) {
        try {
          const feed = await parser.parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${config.youtubeChannelId}`
          );

          if (!feed.items || feed.items.length === 0) continue;

          const latest = feed.items[0];

          // Skip notification on first startup
          if (!config.lastVideo) {
            config.lastVideo = latest.id;
            console.log(
              `📌 Tracking ${config.youtubeChannelId} | Latest: ${latest.title}`
            );
            continue;
          }

          // New upload detected
          if (latest.id !== config.lastVideo) {
            config.lastVideo = latest.id;

            const channel = await client.channels.fetch(
              config.discordChannelId
            );

            if (!channel) {
              console.log(
                `❌ Discord channel not found: ${config.discordChannelId}`
              );
              continue;
            }

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
                    url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                  },
                  footer: {
                    text: "🔥 YouTube Notifications",
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            });

            console.log(
              `✅ Notification sent for ${config.youtubeChannelId}`
            );
          }
        } catch (err) {
          console.error(
            `❌ Error checking ${config.youtubeChannelId}:`,
            err.message
          );
        }
      }
    }, 300000); // Check every 5 minutes
  },
};
