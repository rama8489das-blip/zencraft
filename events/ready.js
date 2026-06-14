const Parser = require("rss-parser");
const { joinVoiceChannel } = require("@discordjs/voice");

const parser = new Parser();

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {

    console.log(`✅ Logged in as ${client.user.tag}`);

    // =======================
    // 🎵 LOAD MUSIC SYSTEM
    // =======================

    try {

      await require("../player")(client);

      console.log("🎵 Music System Loaded");

    } catch (err) {

      console.error("❌ Failed to load music system:", err);

    }

    // =======================
    // 🎧 24/7 VOICE CHANNEL
    // =======================

    try {

      const guild = client.guilds.cache.get("YOUR_GUILD_ID");

      const voiceChannel =
        guild?.channels.cache.get("VOICE_CHANNEL_ID");

      if (voiceChannel) {

        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfDeaf: true,
          selfMute: false
        });

        console.log("🎧 Connected to 24/7 Voice Channel");

      }

    } catch (err) {

      console.error("❌ Voice Connection Error:", err);

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

          if (!feed.items || feed.items.length === 0)
            continue;

          const latest = feed.items[0];

          if (!config.lastVideo) {

            config.lastVideo = latest.id;

            console.log(
              `📌 Tracking ${config.youtubeChannelId} | Latest: ${latest.title}`
            );

            continue;
          }

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
                  description:
                    `🎬 **${latest.title}**\n\n` +
                    `👉 [Watch Now](${latest.link})`,
                  color: 0xff0000,
                  url: latest.link,
                  image: {
                    url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  },
                  footer: {
                    text: "🔥 Powered by Zencraft"
                  },
                  timestamp: new Date().toISOString()
                }
              ]
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

    }, 300000);

  }
};
