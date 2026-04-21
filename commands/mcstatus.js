const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check Minecraft server')

    .addStringOption(o =>
      o.setName('ip')
        .setDescription('Server IP')
        .setRequired(true)
    )

    .addIntegerOption(o =>
      o.setName('port')
        .setDescription('Server port (leave empty for Java)')
    ),

  async execute(interaction) {

    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');

    const address = port ? `${ip}:${port}` : ip;

    await interaction.reply({ content: "⏳ Fetching server status...", ephemeral: true });

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`https://api.mcsrvstat.us/2/${address}`);
        return res.data;
      } catch {
        return null;
      }
    };

    let data = await fetchStatus();

    const buildEmbed = (data) => {
      const embed = new EmbedBuilder()
        .setTitle("🟢 Minecraft Server Status")
        .setColor(data && data.online ? "#57F287" : "#ED4245")
        .setFooter({ text: "Powered by Zencraft SMP" })
        .setTimestamp();

      if (!data || !data.online) {
        return embed.setDescription(
          `❌ **Server Offline**\n\n🌐 **IP:** ${address}`
        );
      }

      const motd = data.motd?.clean?.join("\n") || "No MOTD";
      const online = data.players?.online ?? 0;
      const max = data.players?.max ?? 0;

      return embed.setDescription(
        `🌐 **IP:** ${address}\n\n` +
        `📜 **MOTD:**\n${motd}\n\n` +
        `👥 **Players:** ${online} / ${max}\n\n` +
        `🟢 **Status:** Online`
      );
    };

    const msg = await interaction.channel.send({
      embeds: [buildEmbed(data)]
    });

    // 🔁 LIVE UPDATE EVERY 10s
    const interval = setInterval(async () => {
      data = await fetchStatus();

      await msg.edit({
        embeds: [buildEmbed(data)]
      }).catch(() => {});
    }, 10000);

    // ⏹️ AUTO STOP AFTER 5 MIN (ANTI-LAG)
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  }
};