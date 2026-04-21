const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {

    console.log(`✅ Logged in as ${client.user.tag}`);

    let lastVideo = null;

    setInterval(async () => {
      try {

        const feed = await parser.parseURL(
          "https://www.youtube.com/feeds/videos.xml?channel_id=UCQzpWfAHyxGg1jMfrCIxOdQ"
        );

        if (!feed.items || feed.items.length === 0) return;

        const latest = feed.items[0];

        // 🔥 FIRST RUN SKIP
        if (!lastVideo) {
          lastVideo = latest.id;
          return;
        }

        if (latest.id !== lastVideo) {
          lastVideo = latest.id;

          // ✅ YOUR YT CHANNEL ID
          const channel = client.channels.cache.get("1467154654252105870");

          if (!channel) return console.log("❌ Wrong channel ID");

          await channel.send({
            content: "@everyone 🚨 NEW VIDEO!",
            embeds: [
              {
                title: "📺 New Video Uploaded!",
                description: `🎬 **${latest.title}**\n\n👉 [Watch Now](${latest.link})`,
                color: 0xFF0000,
                image: {
                  url: `https://img.youtube.com/vi/${latest.id.split(':')[2]}/maxresdefault.jpg`
                },
                footer: {
                  text: "🔥 Powered by Zencraft SMP"
                },
                timestamp: new Date()
              }
            ]
          });

          console.log("✅ YouTube notification sent");
        }

      } catch (err) {
        console.log("YouTube Error:", err.message);
      }
    }, 300000); // every 5 min
  }
};
