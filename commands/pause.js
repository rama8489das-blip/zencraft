const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause music'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply('❌ No music playing.');

        queue.node.pause();

        interaction.reply('⏸️ Music paused.');
    }
};
