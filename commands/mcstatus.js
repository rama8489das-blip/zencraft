const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check ZENCRAFT SMP server status'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const status = await util.status('zencraft.primemc.in', 19500);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🟢 ZENCRAFT SMP Server Status')
        .addFields(
          { name: 'IP', value: '`zencraft.primemc.in:19500`' },
          { name: 'Players', value: `${status.players.online} / ${status.players.max}`, inline: true },
          { name: 'Version', value: status.version.name, inline: true },
          { name: 'Ping', value: `${status.roundTripLatency}ms`, inline: true }
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
