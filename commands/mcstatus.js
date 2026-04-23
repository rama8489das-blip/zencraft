const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Store active intervals per guild
const activeUpdates = new Map();

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
    const guildId = interaction.guild.id;

    // ❌ Prevent multiple loops per server
    if (activeUpdates.has(guildId)) {
      return interaction.reply({
        content: "❌ Already running a live status in this server.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: "⏳ Fetching server status...",
      ephemeral: true
    });

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

      const playerList = data.players?.list?.length
        ? data.players.list.slice(0, 10).join(", ")
        : "No players online";

      return embed.setDescription(
        `🌐 **IP:** ${address}\n\n` +
        `📜 **MOTD:**\n${motd}\n\n` +
        `👥 **Players:** ${online} / ${max}\n` +
        `🧑 **Online List:**\n${playerList}\n\n` +
        `🟢 **Status:** Online`
      );
    };

    const msg = await interaction.channel.send({
      embeds: [buildEmbed(data)]
    });

    // 🔁 LIVE UPDATE LOOP (NO AUTO STOP)
    const interval = setInterval(async () => {
      data = await fetchStatus();

      await msg.edit({
        embeds: [buildEmbed(data)]
      }).catch(() => {});
    }, 10000);

    // Save interval
    activeUpdates.set(guildId, interval);

    // 🧹 Cleanup if message deleted
    const collector = msg.createMessageComponentCollector();

    msg.channel.client.on('messageDelete', (deletedMsg) => {
      if (deletedMsg.id === msg.id) {
        clearInterval(interval);
        activeUpdates.delete(guildId);
      }
    });
  }
};
