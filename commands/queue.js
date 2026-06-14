const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show queue'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.tracks.size)
            return interaction.reply('❌ Queue is empty.');

        const tracks = queue.tracks
            .toArray()
            .slice(0, 10)
            .map((song, i) => `${i + 1}. ${song.title}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎵 Music Queue')
            .setDescription(tracks)
            .setFooter({
                text: '🔥 Powered by Zencraft'
            });

        interaction.reply({
            embeds: [embed]
        });
    }
};
