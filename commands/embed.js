const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let cache = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Advanced Embed System')

    // CREATE
    .addSubcommand(c =>
      c.setName('create')
        .setDescription('Create a new embed')

        .addStringOption(o =>
          o.setName('title')
            .setDescription('Embed title')
            .setRequired(true)
        )

        .addStringOption(o =>
          o.setName('desc')
            .setDescription('Embed description')
            .setRequired(true)
        )

        .addStringOption(o =>
          o.setName('color')
            .setDescription('Hex color (e.g. #ff0000)')
        )

        .addStringOption(o =>
          o.setName('url')
            .setDescription('Title URL (clickable)')
        )

        .addStringOption(o =>
          o.setName('footer')
            .setDescription('Footer text')
        )

        .addStringOption(o =>
          o.setName('footer_icon')
            .setDescription('Footer icon URL')
        )

        .addStringOption(o =>
          o.setName('author')
            .setDescription('Author name')
        )

        .addStringOption(o =>
          o.setName('author_icon')
            .setDescription('Author icon URL')
        )

        .addStringOption(o =>
          o.setName('thumbnail')
            .setDescription('Thumbnail URL')
        )

        .addStringOption(o =>
          o.setName('image')
            .setDescription('Main image URL')
        )
    )

    // EDIT
    .addSubcommand(c =>
      c.setName('edit')
        .setDescription('Edit your last embed')

        .addStringOption(o =>
          o.setName('desc')
            .setDescription('New description')
            .setRequired(true)
        )

        .addStringOption(o =>
          o.setName('color')
            .setDescription('New color')
        )
    ),

  async execute(interaction) {

    const sub = interaction.options.getSubcommand();

    // CREATE
    if (sub === 'create') {

      const embed = new EmbedBuilder()
        .setTitle(interaction.options.getString('title'))
        .setDescription(interaction.options.getString('desc'));

      // OPTIONAL SETTINGS
      const color = interaction.options.getString('color');
      const url = interaction.options.getString('url');
      const footer = interaction.options.getString('footer');
      const footerIcon = interaction.options.getString('footer_icon');
      const author = interaction.options.getString('author');
      const authorIcon = interaction.options.getString('author_icon');
      const thumbnail = interaction.options.getString('thumbnail');
      const image = interaction.options.getString('image');

      if (color) embed.setColor(color);
      if (url) embed.setURL(url);
      if (thumbnail) embed.setThumbnail(thumbnail);
      if (image) embed.setImage(image);

      if (author) {
        embed.setAuthor({
          name: author,
          iconURL: authorIcon || null
        });
      }

      if (footer) {
        embed.setFooter({
          text: footer,
          iconURL: footerIcon || null
        });
      } else {
        embed.setFooter({ text: "Powered by Zencraft SMP" });
      }

      const msg = await interaction.reply({
        embeds: [embed],
        fetchReply: true
      });

      cache.set(interaction.user.id, msg.id);
    }

    // EDIT
    if (sub === 'edit') {

      const id = cache.get(interaction.user.id);

      if (!id) {
        return interaction.reply({
          content: "No embed found. Use /embed create first.",
          ephemeral: true
        });
      }

      const msg = await interaction.channel.messages.fetch(id).catch(() => null);

      if (!msg || !msg.embeds.length) {
        return interaction.reply({
          content: "Embed not found or deleted.",
          ephemeral: true
        });
      }

      const embed = EmbedBuilder.from(msg.embeds[0])
        .setDescription(interaction.options.getString('desc'));

      const newColor = interaction.options.getString('color');
      if (newColor) embed.setColor(newColor);

      await msg.edit({ embeds: [embed] });

      await interaction.reply({
        content: "✅ Embed updated successfully",
        ephemeral: true
      });
    }
  }
};
