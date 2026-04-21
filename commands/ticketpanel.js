const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Send ticket panel'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🎫 Zencraft Ticket System")
      .setColor("#5865F2")
      .setDescription(
        `Need help? Open a ticket below.\n\n` +
        `🛠️ Support\n💰 Purchase\n🚨 Report\n\n` +
        `⚠️ You can only have **1 active ticket** at a time`
      )
      .setFooter({ text: "🔥 Powered by Zencraft" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('Select ticket type')
      .addOptions([
        {
          label: 'Support',
          description: 'Get help from staff',
          value: 'support'
        },
        {
          label: 'Purchase',
          description: 'Buy something',
          value: 'purchase'
        },
        {
          label: 'Report',
          description: 'Report a player',
          value: 'report'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};