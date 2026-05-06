const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios';

// Store active intervals per guild
const activeUpdates = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check Minecraft server (Java + Bedrock)')
    .addStringOption(o =>
      o.setName('ip')
        .setDescription('Server IP or domain')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('port')
        .setDescription('Custom port (optional)')
    ),

  async execute(interaction) {
    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');

    const address = port ? `${ip}:${port}` : ip;
    const guildId = interaction.guild.id;

    // ❌ Prevent multiple loops
    if (activeUpdates.has(guildId)) {
      return interaction.reply({
        content: "❌ Already running a live status in this server.",
        flags: 64
      });
    }

    // ✅ FIX: defer reply (prevents timeout)
    await interaction.deferReply({ flags: 64 });

    // 🔥 Fetch function (Java → Bedrock fallback)
    const fetchStatus = async () => {
      try {
        // Java
        const java = await axios.get(
          `https://api.mcstatus.io/v2/status/java/${ip}:${port || 25565}`,
          { timeout: 5000 }
        );

        if (java.data?.online) {
          return { type: "Java", data: java.data };
        }

        // Bedrock fallback
        const bedrock = await axios.get(
          `https://api.mcstatus.io/v2/status/bedrock/${ip}:${port || 19132}`,
          { timeout: 5000 }
        );

        if (bedrock.data?.online) {
          return { type: "Bedrock", data: bedrock.data };
        }

        return null;

      } catch (err) {
        return null;
      }
    };

    // 🎨 Embed builder
    const buildEmbed = (result) => {
      const embed = new EmbedBuilder()
        .setTitle("🟢 Minecraft Server Status")
        .setFooter({ text: "Powered by Zencraft SMP" })
        .setTimestamp();

      if (!result || !result.data?.online) {
        return embed
          .setColor("#ED4245")
          .setDescription(`❌ **Server Offline**\n\n🌐 **IP:** ${address}`);
      }

      const data = result.data;

      const motd =
        data.motd?.clean?.join("\n") ||
        data.motd?.raw ||
        "No MOTD";

      const online = data.players?.online ?? 0;
      const max = data.players?.max ?? 0;

      const playerList = data.players?.list?.length
        ? data.players.list.slice(0, 10).join(", ")
        : "No players online";

      return embed
        .setColor("#57F287")
        .setDescription(
          `🌐 **IP:** ${address}\n` +
          `🧩 **Type:** ${result.type}\n\n` +
          `📜 **MOTD:**\n${motd}\n\n` +
          `👥 **Players:** ${online} / ${max}\n` +
          `🧑 **Online List:**\n${playerList}\n\n` +
          `🟢 **Status:** Online`
        );
    };

    // 🔄 First fetch
    let data = await fetchStatus();

    // ✅ FIX: use editReply instead of send
    const msg = await interaction.editReply({
      embeds: [buildEmbed(data)]
    });

    // 🔁 Live update loop
    const interval = setInterval(async () => {
      const newData = await fetchStatus();

      await interaction.editReply({
        embeds: [buildEmbed(newData)]
      }).catch(() => {});
    }, 10000);

    activeUpdates.set(guildId, interval);

    // 🧹 Cleanup when bot restarts or message deleted
    const cleanup = () => {
      clearInterval(interval);
      activeUpdates.delete(guildId);
    };

    // Stop loop if message deleted
    const deleteHandler = (deletedMsg) => {
      if (deletedMsg.id === msg.id) {
        cleanup();
        interaction.client.off('messageDelete', deleteHandler);
      }
    };

    interaction.client.on('messageDelete', deleteHandler);
  }
};
