const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Current song'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue?.currentTrack)
            return interaction.reply('❌ Nothing playing.');

        const track = queue.currentTrack;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎶 Now Playing')
            .setDescription(`**${track.title}**`)
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: '🔥 Powered by Zencraft'
            });

        interaction.reply({
            embeds: [embed]
        });
    }
};
