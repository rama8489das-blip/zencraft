const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const activeUpdates = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check Minecraft server (Java + Bedrock)')
    .addStringOption(o =>
      o.setName('ip').setDescription('Server IP').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('port').setDescription('Server port')
    ),

  async execute(interaction) {

    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');

    const address = port ? `${ip}:${port}` : ip;
    const guildId = interaction.guild.id;

    if (activeUpdates.has(guildId)) {
      return interaction.reply({
        content: "❌ Already running in this server",
        flags: 64
      });
    }

    // ✅ FIX: prevent timeout
    await interaction.deferReply({ flags: 64 });

    // 🔥 FETCH
    const fetchStatus = async () => {
      try {
        const java = await axios.get(
          `https://api.mcstatus.io/v2/status/java/${ip}:${port || 25565}`
        );

        if (java.data?.online) {
          return { type: "Java", data: java.data };
        }

        const bedrock = await axios.get(
          `https://api.mcstatus.io/v2/status/bedrock/${ip}:${port || 19132}`
        );

        if (bedrock.data?.online) {
          return { type: "Bedrock", data: bedrock.data };
        }

        return null;
      } catch {
        return null;
      }
    };

    // 🎨 EMBED
    const buildEmbed = (result) => {
      const embed = new EmbedBuilder()
        .setTitle("🟢 Minecraft Server Status")
        .setFooter({ text: "Powered by Zencraft SMP" })
        .setTimestamp();

      if (!result || !result.data?.online) {
        return embed
          .setColor("#ED4245")
          .setDescription(`❌ Server Offline\n\n🌐 IP: ${address}`);
      }

      const data = result.data;

      // ✅ SAFE MOTD FIX
      let motd = "No MOTD";

      if (Array.isArray(data.motd?.clean)) {
        motd = data.motd.clean.join("\n");
      } else if (typeof data.motd?.clean === "string") {
        motd = data.motd.clean;
      } else if (Array.isArray(data.motd?.raw)) {
        motd = data.motd.raw.join("\n");
      } else if (typeof data.motd?.raw === "string") {
        motd = data.motd.raw;
      }

      const online = data.players?.online ?? 0;
      const max = data.players?.max ?? 0;

      const playerList = Array.isArray(data.players?.list)
        ? data.players.list.slice(0, 10).join(", ")
        : "No players online";

      return embed
        .setColor("#57F287")
        .setDescription(
          `🌐 IP: ${address}\n` +
          `🧩 Type: ${result.type}\n\n` +
          `📜 MOTD:\n${motd}\n\n` +
          `👥 Players: ${online} / ${max}\n` +
          `🧑 List: ${playerList}\n\n` +
          `🟢 Status: Online`
        );
    };

    // FIRST LOAD
    let data = await fetchStatus();

    const msg = await interaction.editReply({
      embeds: [buildEmbed(data)]
    });

    // 🔁 LOOP
    const interval = setInterval(async () => {
      const newData = await fetchStatus();

      await interaction.editReply({
        embeds: [buildEmbed(newData)]
      }).catch(() => {});
    }, 10000);

    activeUpdates.set(guildId, interval);

    // 🧹 CLEANUP
    const deleteHandler = (deletedMsg) => {
      if (deletedMsg.id === msg.id) {
        clearInterval(interval);
        activeUpdates.delete(guildId);
        interaction.client.off('messageDelete', deleteHandler);
      }
    };

    interaction.client.on('messageDelete', deleteHandler);
  }
};
