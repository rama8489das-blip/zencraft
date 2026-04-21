const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show commands'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("📜 Zencraft Commands")
      .setColor("#FF0000") // 🔴 RED COLOR

      .setDescription(`
/embed create  
/embed edit  
/giveaway  
/gexit  
/poll  
/ticketpanel  
/mcstatus  
/help
`)

      .setFooter({ text: "Powered by Zencraft SMP" });

    await interaction.reply({ embeds: [embed] });
  }
};

