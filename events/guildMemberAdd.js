const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {

    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL);

    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome to Zencraft SMP!")
      .setColor("#57F287")

      .setDescription(
        `🎉 Hey ${member}, welcome to **Zencraft SMP**!\n\n` +

        `🌍 One of the **Top Tamil Minecraft Servers 🇮🇳**\n\n` +

        `📜 Read rules: <#1467154654096789750>\n` +
        `📡 Server IP: <#1467154654096789753>\n\n` +

        `💬 Enjoy your stay and make amazing memories! 🚀`
      )

      // 👤 Avatar (top right)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))

      // 🔥 POWERED BY
      .setFooter({ text: "🔥 Powered by Zencraft" })

      .setTimestamp();

    channel.send({
      content: `🎉 Welcome ${member}!`,
      embeds: [embed]
    });
  }
};