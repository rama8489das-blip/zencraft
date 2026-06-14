const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube')
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

        const permissions = voiceChannel.permissionsFor(interaction.client.user);

        if (
            !permissions.has('Connect') ||
            !permissions.has('Speak')
        ) {
            return interaction.reply({
                content: '❌ I need Connect and Speak permissions.',
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
                        volume: 75,
                        leaveOnEmpty: false,
                        leaveOnEnd: false,
                        leaveOnStop: false
                    }
                }
            );

            if (!result || !result.track) {
                return interaction.editReply({
                    content: '❌ No results found.'
                });
            }

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
                .setFooter({
                    text: '🔥 Powered by Zencraft'
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

            console.log(`▶️ Play Request: ${track.title}`);

        } catch (error) {

            console.error('PLAY ERROR:', error);

            await interaction.editReply({
                content: `❌ Failed to play song.\n\`\`\`${error.message}\`\`\``
            });
        }
    }
};
