const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply('❌ No music playing.');

        queue.delete();

        interaction.reply('⏹️ Music stopped.');
    }
};
