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
    .setName('poll')
    .setDescription('Create a PRO poll')

    // ✅ REQUIRED FIRST
    .addStringOption(o =>
      o.setName('question')
        .setDescription('Poll question')
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName('duration')
        .setDescription('10s / 5m / 1h / 1d')
        .setRequired(true)
    )

    // ✅ OPTIONAL AFTER REQUIRED (IMPORTANT FIX)
    .addStringOption(o =>
      o.setName('option1')
        .setDescription('Option 1')
    )

    .addStringOption(o =>
      o.setName('option2')
        .setDescription('Option 2')
    )

    .addStringOption(o =>
      o.setName('option3')
        .setDescription('Option 3')
    )

    .addStringOption(o =>
      o.setName('option4')
        .setDescription('Option 4')
    )

    .addStringOption(o =>
      o.setName('option5')
        .setDescription('Option 5')
    ),

  async execute(interaction, client) {

    const question = interaction.options.getString('question');
    const durationInput = interaction.options.getString('duration');
    const duration = parse(durationInput);

    if (!duration) {
      return interaction.reply({
        content: "❌ Invalid duration format (use 10s / 5m / 1h / 1d)",
        ephemeral: true
      });
    }

    // 📊 OPTIONS
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
      interaction.options.getString('option5')
    ].filter(Boolean);

    if (options.length < 2) {
      return interaction.reply({
        content: "❌ You must provide at least 2 options",
        ephemeral: true
      });
    }

    const end = Date.now() + duration;
    const endTimestamp = Math.floor(end / 1000);

    // 🗳️ POLL STORAGE
    client.polls ??= new Map();
    client.polls.set(interaction.id, {
      votes: {},
      ended: false
    });

    options.forEach((_, i) => {
      client.polls.get(interaction.id).votes[i] = new Set();
    });

    // 🎨 EMBED BUILDER
    const buildEmbed = () => {
      const data = client.polls.get(interaction.id);

      let desc = `❓ **${question}**\n\n`;

      options.forEach((opt, i) => {
        const count = data.votes[i].size;
        desc += `**${i + 1}. ${opt}** — 🗳️ ${count}\n`;
      });

      desc += `\n⏳ Ends: <t:${endTimestamp}:R>\n📅 <t:${endTimestamp}:F>`;

      return new EmbedBuilder()
        .setTitle("📊 PRO POLL")
        .setColor("#5865F2")
        .setDescription(desc)
        .setFooter({ text: "🔥 Powered by Zencraft" })
        .setTimestamp(end);
    };

    // 🔘 BUTTONS
    const row = new ActionRowBuilder();

    options.forEach((opt, i) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_${interaction.id}_${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const msg = await interaction.reply({
      embeds: [buildEmbed()],
      components: [row],
      fetchReply: true
    });

    // 🔁 LIVE UPDATE
    const interval = setInterval(() => {
      const data = client.polls.get(interaction.id);
      if (!data || data.ended) return clearInterval(interval);

      msg.edit({ embeds: [buildEmbed()] }).catch(() => {});
    }, 5000);

    // ⏹️ END POLL
    setTimeout(async () => {
      clearInterval(interval);

      const data = client.polls.get(interaction.id);
      if (!data) return;

      data.ended = true;

      const disabledRow = new ActionRowBuilder();

      options.forEach((opt, i) => {
        disabledRow.addComponents(
          new ButtonBuilder()
            .setCustomId('ended')
            .setLabel(`${i + 1}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );
      });

      const endEmbed = buildEmbed()
        .setTitle("📊 POLL ENDED")
        .setColor("#ED4245");

      await msg.edit({
        embeds: [endEmbed],
        components: [disabledRow]
      });

    }, duration);
  }
};
