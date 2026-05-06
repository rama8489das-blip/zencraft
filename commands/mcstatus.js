const { EmbedBuilder } = require('discord.js');
const mcstatus = require('mcstatus');

module.exports = {
  name: 'mcstatus',
  description: 'Check Minecraft server status',
  
  async execute(message) {

    const server = new mcstatus.JavaServer({
      host: 'zencraft.primemc.in',
      port: 19500
    });

    try {
      const status = await server.status();

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🟢 ZENCRAFT SMP Server Status')
        .addFields(
          { name: 'IP', value: '`zencraft.primemc.in:19500`', inline: false },
          { name: 'Players', value: `${status.players.online} / ${status.players.max}`, inline: true },
          { name: 'Version', value: status.version.name, inline: true },
          { name: 'Ping', value: `${status.roundTripLatency}ms`, inline: true }
        )
        .setFooter({ text: 'ZENCRAFT SMP' })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔴 Server Offline')
        .setDescription('The server is currently offline or unreachable.')
        .addFields(
          { name: 'IP', value: '`zencraft.primemc.in:19500`' }
        );

      message.channel.send({ embeds: [embed] });
    }
  }
};
