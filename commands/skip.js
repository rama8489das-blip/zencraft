const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip current song'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply('❌ No music playing.');

        queue.node.skip();

        interaction.reply('⏭️ Song skipped.');
    }
};
