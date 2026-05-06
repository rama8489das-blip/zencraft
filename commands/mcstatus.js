const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');

let panelRunning = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Create live ZENCRAFT SMP status panel'),

  async execute(interaction) {
    try {
      // ✅ ALWAYS defer FIRST
      await interaction.deferReply({ flags: 64 });

      if (panelRunning) {
        return await interaction.editReply('⚠️ Panel already running!');
      }

      panelRunning = true;

      const panelMessage = await interaction.channel.send('🔄 Loading server status...');
      await interaction.editReply('✅ Live panel created!');

      setInterval(async () => {
        try {
          const status = await util.status('zencraft.primemc.in', 19500);

          const motd = status.motd?.clean || 'No MOTD';

          let playerList = 'No players online';
          if (status.players?.sample?.length) {
            playerList = status.players.sample.map(p => `• ${p.name}`).join('\n');
          }

          const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🟢 ZENCRAFT SMP (LIVE)')
            .addFields(
              { name: '📡 IP', value: '`zencraft.primemc.in:19500`' },
              { name: '📜 MOTD', value: motd },
              { name: '👥 Players', value: `Online: ${status.players.online}\nMax: ${status.players.max}`, inline: true },
              { name: '🧍 Player List', value: playerList },
              { name: '⚙️ Version', value: status.version.name, inline: true },
              { name: '🏓 Ping', value: `${status.roundTripLatency}ms`, inline: true }
            )
            .setFooter({ text: 'Powered by ZENCRAFT SMP' })
            .setTimestamp();

          await panelMessage.edit({ embeds: [embed], content: '' });

        } catch {
          await panelMessage.edit({
            embeds: [
              new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔴 Server Offline')
                .setFooter({ text: 'Powered by ZENCRAFT SMP' })
            ],
            content: ''
          });
        }
      }, 10000);

    } catch (error) {
      console.error(error);

      // ✅ FIX: NEVER use reply here
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('❌ Failed to create panel.');
      }
    }
  }
};
