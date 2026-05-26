const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
    .setName('verifypanel')
    .setDescription('Send verification panel')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle('✅ Zencraft Verification')
      .setColor('#57F287')
      .setDescription(
        'Click the button below to verify yourself and access the server.'
      )
      .setFooter({
        text: '🔥 Powered by Zencraft'
      });

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('Click To Verify')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)

    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ Verification panel sent.',
      flags: 64
    });
  }
};
