const { EmbedBuilder } = require('discord.js');

const userMessages = new Map();

// 🎯 YOUR GENERAL CHANNEL ID
const GENERAL_CHANNEL_ID = "1467154654096789757";

module.exports = {
  name: 'messageCreate',

  async execute(message) {

    if (message.author.bot) return;

    // =========================
    // 🚫 BLOCK LINKS ONLY IN GENERAL
    // =========================
    if (message.channel.id === GENERAL_CHANNEL_ID) {

      const linkRegex = /(https?:\/\/|www\.|discord\.gg|\.com|\.net|\.org)/i;

      if (linkRegex.test(message.content)) {
        await message.delete().catch(() => {});

        return message.channel.send({
          content: `${message.author} ❌ Links are not allowed in this channel!`
        }).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 3000));
      }
    }

    // =========================
    // 🔥 ANTI SPAM (ALL CHANNELS)
    // =========================
    const now = Date.now();
    const data = userMessages.get(message.author.id) || {
      count: 0,
      last: now
    };

    data.count++;
    data.last = now;

    userMessages.set(message.author.id, data);

    if (data.count >= 5) {
      await message.delete().catch(() => {});

      return message.channel.send({
        content: `${message.author} 🚫 Stop spamming!`
      }).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 3000));
    }

    setTimeout(() => {
      userMessages.delete(message.author.id);
    }, 5000);

    // =========================
    // 📡 IP AUTO RESPONSE
    // =========================
    if (message.content.toLowerCase() === "ip") {

      const embed = new EmbedBuilder()
        .setTitle("📡 Zencraft SMP Server IP")
        .setColor("#57F287")

        .setDescription(
          `💻 **Java Edition IP:**\n` +
          `\`\`\`\npaid-1.endernodes.xyz:25573\n\`\`\`\n\n` +

          `📱 **Bedrock Edition IP:**\n` +
          `\`\`\`\npaid-1.endernodes.xyz\n\`\`\`\n\n` +

          `🔌 **Bedrock Port:**\n` +
          `\`\`\`\n19132\n\`\`\`\n\n` +

          `📋 Easy to copy above!`
        )

        .setFooter({ text: "🔥 Powered by Zencraft SMP" });

      return message.channel.send({
        embeds: [embed]
      });
    }
  }
};
