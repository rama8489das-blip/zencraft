const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change volume')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('1-100')
                .setRequired(true)
        ),

    async execute(interaction) {

        const volume =
            interaction.options.getInteger('amount');

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply('❌ Nothing playing.');

        queue.node.setVolume(volume);

        interaction.reply(
            `🔊 Volume set to ${volume}%`
        );
    }
};
