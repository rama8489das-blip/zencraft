const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube or Spotify')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Song name, YouTube URL, or Spotify URL')
                .setRequired(true)
        ),

    async execute(interaction) {

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ You must join a voice channel first.',
                ephemeral: true
            });
        }

        const query = interaction.options.getString('query');

        await interaction.deferReply();

        try {

            const { track } = await interaction.client.player.play(
                voiceChannel,
                query,
                {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        metadata: interaction.channel,
                        leaveOnEmpty: false,
                        leaveOnEnd: false,
                        leaveOnStop: false,
                        volume: 75
                    }
                }
            );

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎵 Added To Queue')
                .setDescription(
                    `**${track.title}**\n\n` +
                    `👤 Artist: ${track.author}\n` +
                    `⏱️ Duration: ${track.duration}\n` +
                    `🎶 Requested By: ${interaction.user}`
                )
                .setThumbnail(track.thumbnail)
                .setImage(
                    'https://images.unsplash.com/photo-1511379938547-c1f69419868d'
                )
                .setFooter({
                    text: '🔥 Powered by Zencraft'
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(error);

            interaction.editReply({
                content: '❌ Failed to play song.'
            });
        }
    }
};
