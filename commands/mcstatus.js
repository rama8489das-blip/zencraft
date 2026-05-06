const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');

// ✅ prevent multiple panels
let panelRunning = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Create live server status panel'),

  async execute(interaction) {

    // ✅ fix interaction timeout
    await interaction.deferReply({ flags: 64 }); // ephemeral

    if (panelRunning) {
      return interaction.editReply('⚠️ Live panel is already running!');
    }

    panelRunning = true;

    const channel = interaction.channel;

    // create panel message
    const panelMessage = await channel.send('🔄 Loading server status...');

    await interaction.editReply('✅ Live panel created!');

    // 🔁 infinite updater
    setInterval(async () => {
      try {
        const status = await util.status('zencraft.primemc.in', 19500, {
          timeout: 5000
        });

        // ✅ MOTD
        let motd = status.motd.clean || 'No MOTD';

        // ✅ Player list
        let playerList = 'No players online';
        if (status.players.sample && status.players.sample.length > 0) {
          playerList = status.players.sample
            .map(p => `• ${p.name}`)
            .join('\n');
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🟢 ZENCRAFT SMP (LIVE)')
          .addFields(
            { name: '📡 IP', value: '`zencraft.primemc.in:19500`' },
            { name: '📜 MOTD', value: motd },
            {
              name: '👥 Players',
              value: `Online: ${status.players.online}\nMax: ${status.players.max}`,
              inline: true
            },
            { name: '🧍 Player List', value: playerList },
            { name: '⚙️ Version', value: status.version.name, inline: true },
            { name: '🏓 Ping', value: `${status.roundTripLatency}ms`, inline: true }
          )
          .setFooter({ text: 'Powered by ZENCRAFT SMP' })
          .setTimestamp();

        await panelMessage.edit({ content: '', embeds: [embed] });

      } catch (err) {

        const offlineEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔴 Server Offline')
          .setDescription('Cannot reach server')
          .setFooter({ text: 'Powered by ZENCRAFT SMP' });

        await panelMessage.edit({ content: '', embeds: [offlineEmbed] });
      }
    }, 10000); // every 10 sec
  }
};
