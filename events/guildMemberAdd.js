const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {

    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#57F287")

      .setTitle("🎮 Zencraft SMP!")

      .setDescription(
        `👋 Welcome ${member} to **Zencraft SMP**!\n\n` +

        `🌍 One of the best **Tamil Minecraft Communities 🇮🇳**\n\n` +

        `📖 **Rules**\n` +
        `➡️ <#1467154654096789752>\n\n` +

        `📡 **Server IP**\n` +
        `➡️ <#1515615201498497274>\n\n` +

        `🎟️ Need help? Create a ticket anytime.\n` +
        `🤝 Meet new players and build your legacy.\n` +
        `⚔️ Compete, survive, and dominate the SMP.\n` +
        `🏆 Participate in events and win rewards.\n\n` +

        `🔥 We hope you enjoy your stay and become part of the Zencraft family!`
      )

      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true,
          size: 512
        })
      )

      // Minecraft-themed banner image
      .setImage(
        "https://i.imgur.com/j6sM6xS.jpeg"
      )

      .setFooter({
        text: `🔥 Powered by Zencraft • Member #${member.guild.memberCount}`
      })

      .setTimestamp();

    await channel.send({
      content: `🎉 Welcome ${member} to the server!`,
      embeds: [embed]
    });
  }
};
