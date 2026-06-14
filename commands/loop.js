const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop'),

    async execute(interaction) {

        const queue =
            interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply('❌ Nothing playing.');

        const mode =
            queue.repeatMode === QueueRepeatMode.TRACK
                ? QueueRepeatMode.OFF
                : QueueRepeatMode.TRACK;

        queue.setRepeatMode(mode);

        interaction.reply(
            mode === QueueRepeatMode.TRACK
                ? '🔁 Loop enabled.'
                : '⏹️ Loop disabled.'
        );
    }
};
