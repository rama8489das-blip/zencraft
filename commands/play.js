const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

const { useMainPlayer } = require('discord-player');

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
                content: '❌ You must join a voice channel first.',
                ephemeral: true
            });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);

        if (
            !permissions?.has(PermissionsBitField.Flags.Connect) ||
            !permissions?.has(PermissionsBitField.Flags.Speak)
        ) {
            return interaction.reply({
                content: '❌ I need **Connect** and **Speak** permissions in your voice channel.',
                ephemeral: true
            });
        }

        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        try {

            const player = useMainPlayer();

            const result = await player.play(voiceChannel, query, {
                requestedBy: interaction.user,
                nodeOptions: {
                    metadata: interaction.channel,
                    volume: 75,
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false
                }
            });

            // discord-player v7 safe track extraction
            const track =
                result?.track ||
                result?.queue?.currentTrack ||
                result;

            if (!track) {
                return interaction.editReply({
                    content: '❌ No results found for your query.'
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎵 Now Playing')
                .setDescription(
                    `**${track.title || 'Unknown Title'}**\n\n` +
                    `👤 Author: ${track.author || 'Unknown'}\n` +
                    `⏱️ Duration: ${track.duration || 'Unknown'}\n` +
                    `🎧 Requested By: ${interaction.user}`
                )
                .setThumbnail(track.thumbnail || null)
                .setFooter({
                    text: '🔥 Zencraft Music System'
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

            console.log(`▶️ Playing: ${track.title}`);

        } catch (error) {

            console.error('❌ PLAY ERROR:', error);

            await interaction.editReply({
                content: `❌ Failed to play song:\n\`\`\`${error.message}\`\`\``
            });
        }
    }
};
