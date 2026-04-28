const { EmbedBuilder } = require('discord.js');

const userMessages = new Map();

// 🎯 YOUR GENERAL CHANNEL ID
const GENERAL_CHANNEL_ID = "1467154654096789757";

// ⚙️ SETTINGS
const SPAM_LIMIT = 5;           // messages
const SPAM_INTERVAL = 5000;     // 5 sec window
const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const DUPLICATE_LIMIT = 3;      // same msg repeated

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
    // 🔥 ADVANCED ANTI-SPAM
    // =========================
    const now = Date.now();

    let userData = userMessages.get(message.author.id);

    if (!userData) {
      userData = {
        timestamps: [],
        messages: []
      };
    }

    // Add current message
    userData.timestamps.push(now);
    userData.messages.push(message.content);

    // Keep only last 5 seconds
    userData.timestamps = userData.timestamps.filter(t => now - t < SPAM_INTERVAL);
    userData.messages = userData.messages.slice(-5);

    userMessages.set(message.author.id, userData);

    // 🚫 FAST SPAM DETECTION
    if (userData.timestamps.length >= SPAM_LIMIT) {

      await message.delete().catch(() => {});

      if (message.member && message.member.moderatable) {
        await message.member.timeout(TIMEOUT_DURATION, "Fast spamming")
          .catch(() => {});
      }

      userMessages.delete(message.author.id);

      return message.channel.send({
        content: `${message.author} 🚫 Timed out for 5 minutes (spam detected)`
      }).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 5000));
    }

    // 🚫 DUPLICATE SPAM DETECTION
    const duplicates = userData.messages.filter(m => m === message.content);

    if (duplicates.length >= DUPLICATE_LIMIT && message.content.length > 3) {

      await message.delete().catch(() => {});

      if (message.member && message.member.moderatable) {
        await message.member.timeout(TIMEOUT_DURATION, "Duplicate spam")
          .catch(() => {});
      }

      userMessages.delete(message.author.id);

      return message.channel.send({
        content: `${message.author} 🚫 Timed out for 5 minutes (duplicate spam)`
      }).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 5000));
    }

    // =========================
    // 📡 IP AUTO RESPONSE
    // =========================
    if (message.content.toLowerCase() === "ip") {

      const embed = new EmbedBuilder()
        .setTitle("📡 Zencraft Primecraft Lifesteal Server IP")
        .setColor("#57F287")
        .setDescription(
          `💻 **Java Edition IP:**\n` +
          `\`\`\`\nComming Soon..\n\`\`\`\n\n` +

          `📱 **Bedrock Edition IP:**\n` +
          `\`\`\`\nComming Soon..\n\`\`\`\n\n` +

          `🔌 **Bedrock Port:**\n` +
          `\`\`\`\nComming Soon..\n\`\`\`\n\n` +

          `📋 Easy to copy above!`
        )
        .setFooter({ text: "🔥 Powered by Zencraft SMP" });

      return message.channel.send({
        embeds: [embed]
      });
    }
  }
};
