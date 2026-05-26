const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verifypanel')
        .setDescription('Send verification panel'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#ff4500')
            .setTitle('🔒 Verification Required')
            .setDescription(
                'Click the button below to verify yourself and unlock access to the server.\n\n' +
                '> You must verify before viewing any channels or chats.'
            )
            .setFooter({
                text: '🔥 Powered By Zencraft'
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Click To Verify')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
