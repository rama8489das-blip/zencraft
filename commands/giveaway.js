const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

// 🕒 TIME PARSER
function parse(t) {
  const n = parseInt(t);
  if (isNaN(n)) return null;

  if (t.endsWith('s')) return n * 1000;
  if (t.endsWith('m')) return n * 60000;
  if (t.endsWith('h')) return n * 3600000;
  if (t.endsWith('d')) return n * 86400000;

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a PRO giveaway')

    .addStringOption(o =>
      o.setName('duration')
        .setDescription('10s / 5m / 1h / 1d')
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName('prize')
        .setDescription('Prize')
        .setRequired(true)
    )

    .addIntegerOption(o =>
      o.setName('winners')
        .setDescription('Number of winners')
        .setMinValue(1)
        .setMaxValue(10)
    )

    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Giveaway channel')
    ),

  async execute(interaction, client) {

    const duration = parse(interaction.options.getString('duration'));
    const prize = interaction.options.getString('prize');
    const winnersCount = interaction.options.getInteger('winners') || 1;
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!duration) {
      return interaction.reply({
        content: "❌ Invalid time format (10s / 5m / 1h / 1d)",
        ephemeral: true
      });
    }

    const end = Date.now() + duration;
    const endTimestamp = Math.floor(end / 1000);

    const embed = new EmbedBuilder()
      .setTitle("🎉 **GIVEAWAY STARTED**")
      .setColor("#5865F2")
      .setDescription(
        `🎁 **Prize:** ${prize}\n\n` +
        `⏳ **Ends:** <t:${endTimestamp}:R>\n` +
        `📅 **End Time:** <t:${endTimestamp}:F>\n\n` +
        `👥 **Entries:** 0\n\n` +
        `🏆 **Winners:** ${winnersCount}\n\n` +
        `👉 Click below to join!`
      )
      .setFooter({ text: `Hosted by ${interaction.user.username}` })
      .setTimestamp(end);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw_join')
        .setLabel('🎉 Join Giveaway')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ content: "✅ Giveaway started!", ephemeral: true });

    const msg = await channel.send({
      embeds: [embed],
      components: [row]
    });

    client.giveaways.set(msg.id, {
      users: new Set(),
      ended: false
    });

    // 🔁 UPDATE ENTRIES ONLY
    const interval = setInterval(async () => {
      const g = client.giveaways.get(msg.id);
      if (!g || g.ended) return clearInterval(interval);

      const updated = new EmbedBuilder()
        .setTitle("🎉 **GIVEAWAY LIVE**")
        .setColor("#5865F2")
        .setDescription(
          `🎁 **Prize:** ${prize}\n\n` +
          `⏳ **Ends:** <t:${endTimestamp}:R>\n` +
          `📅 **End Time:** <t:${endTimestamp}:F>\n\n` +
          `👥 **Entries:** ${g.users.size}\n\n` +
          `🏆 **Winners:** ${winnersCount}\n\n` +
          `👉 Click below to join!`
        )
        .setFooter({ text: `Hosted by ${interaction.user.username}` })
        .setTimestamp(end);

      msg.edit({ embeds: [updated] }).catch(() => {});
    }, 5000);

    // ⏹️ END GIVEAWAY
    setTimeout(async () => {
      clearInterval(interval);

      const g = client.giveaways.get(msg.id);
      if (!g) return;

      g.ended = true;

      const shuffled = [...g.users].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, winnersCount);

      const winnerText = winners.length
        ? winners.map(id => `<@${id}>`).join(', ')
        : "No participants";

      const endEmbed = new EmbedBuilder()
        .setTitle("🎉 **GIVEAWAY ENDED**")
        .setColor(winners.length ? "#57F287" : "#ED4245")
        .setDescription(
          `🎁 **Prize:** ${prize}\n\n` +
          `🏆 **Winner(s):** ${winnerText}`
        )
        .setFooter({ text: "Giveaway Finished" })
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('gw_end')
          .setLabel('Giveaway Ended')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await msg.edit({
        embeds: [endEmbed],
        components: [disabledRow]
      });

      if (winners.length) {
        await channel.send(`🎉 Congratulations ${winnerText}! You won **${prize}**!`);
      }

    }, duration);
  }
};
