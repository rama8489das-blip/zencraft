const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from YouTube / SoundCloud')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
    ),

  async execute(interaction) {

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Join a voice channel first.',
        ephemeral: true
      });
    }

    const botPerms = voiceChannel.permissionsFor(interaction.client.user);

    if (
      !botPerms?.has(PermissionsBitField.Flags.Connect) ||
      !botPerms?.has(PermissionsBitField.Flags.Speak)
    ) {
      return interaction.reply({
        content: '❌ I need Connect + Speak permissions.',
        ephemeral: true
      });
    }

    const query = interaction.options.getString('query');

    await interaction.deferReply();

    try {

      const player = interaction.client.player;

      const result = await player.play(voiceChannel, query, {
        requestedBy: interaction.user,
        nodeOptions: {
          metadata: {
            channel: interaction.channel
          },
          volume: 75,
          leaveOnEmpty: false,
          leaveOnEnd: false,
          leaveOnStop: false
        }
      });

      const track = result.track;

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎵 Now Playing')
        .setDescription(
          `**${track.title}**\n\n` +
          `👤 Author: ${track.author}\n` +
          `⏱️ Duration: ${track.duration}\n` +
          `🎧 Requested By: ${interaction.user}`
        )
        .setThumbnail(track.thumbnail)
        .setFooter({ text: 'Zencraft Music System' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      console.log(`▶️ Playing: ${track.title}`);

    } catch (error) {
      console.error('PLAY ERROR:', error);

      await interaction.editReply({
        content: `❌ Error: ${error.message}`
      });
    }
  }
};
