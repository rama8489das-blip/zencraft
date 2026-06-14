const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube or Spotify')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Song name, YouTube URL or Spotify URL')
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

        const query = interaction.options.getString('query');

        await interaction.deferReply();

        try {

            const result = await interaction.client.player.play(
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

            const track = result.track;

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎵 Added To Queue')
                .setDescription(
                    `**${track.title}**\n\n` +
                    `👤 Author: ${track.author}\n` +
                    `⏱️ Duration: ${track.duration}\n` +
                    `🎧 Requested By: ${interaction.user}`
                )
                .setThumbnail(track.thumbnail)
                .setImage(track.thumbnail)
                .setFooter({
                    text: '🔥 Powered by Zencraft'
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(error);

            await interaction.editReply({
                content: '❌ Failed to play song. Check the URL or song name.'
            });

        }
    }
};
