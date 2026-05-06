const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check ZENCRAFT SMP server full status'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const status = await util.status('zencraft.primemc.in', 19500, {
        enableSRV: true,
        timeout: 5000
      });

      // 🧾 MOTD (clean text)
      let motd = status.motd.clean || 'No MOTD';

      // 👥 Player list
      let playerList = 'No players online';
      if (status.players.sample && status.players.sample.length > 0) {
        playerList = status.players.sample
          .map(p => `• ${p.name}`)
          .join('\n');
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🟢 ZENCRAFT SMP Server Status')
        .addFields(
          { name: '📡 IP', value: '`zencraft.primemc.in:19500`' },
          { name: '📜 MOTD', value: motd },
          { 
            name: '👥 Players', 
            value: `Online: ${status.players.online}\nMax: ${status.players.max}`, 
            inline: true 
          },
          { name: '🧍 Player List', value: playerList || 'None' },
          { name: '⚙️ Version', value: status.version.name, inline: true },
          { name: '🏓 Ping', value: `${status.roundTripLatency}ms`, inline: true }
        )
        .setFooter({ text: 'ZENCRAFT SMP' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔴 Server Offline')
        .setDescription('The server is currently offline or unreachable.')
        .addFields(
          { name: 'IP', value: '`zencraft.primemc.in:19500`' }
        );

      await interaction.editReply({ embeds: [embed] });
    }
  }
};
