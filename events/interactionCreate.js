const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

// 🔒 STORE ACTIVE TICKETS
const activeTickets = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // =========================
    // ✅ COMMAND HANDLER (FIXED)
    // =========================
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;

      try {
        await cmd.execute(interaction, client);
      } catch (error) {
        console.error(error);

        // ✅ SAFE RESPONSE (prevents crash)
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('❌ Error executing command');
        } else {
          await interaction.reply({
            content: '❌ Error executing command',
            flags: 64
          });
        }
      }
      return;
    }

    // =========================
    // 🎉 BUTTON HANDLER
    // =========================
    if (interaction.isButton()) {

      try {

        // 🎉 GIVEAWAY
        if (interaction.customId === 'gw_join') {

          const g = client.giveaways.get(interaction.message.id);
          if (!g || g.ended) {
            return interaction.reply({ content: "Giveaway ended!", flags: 64 });
          }

          if (g.users.has(interaction.user.id)) {
            g.users.delete(interaction.user.id);
            return interaction.reply({ content: "❌ You left the giveaway", flags: 64 });
          } else {
            g.users.add(interaction.user.id);
            return interaction.reply({ content: "✅ You joined the giveaway", flags: 64 });
          }
        }

        // =========================
        // 📊 POLL SYSTEM
        // =========================
        if (interaction.customId.startsWith('poll_')) {

          const [_, pollId, index] = interaction.customId.split('_');
          const poll = client.polls.get(pollId);

          if (!poll || poll.ended) {
            return interaction.reply({ content: "Poll ended!", flags: 64 });
          }

          const userId = interaction.user.id;

          Object.values(poll.votes).forEach(set => set.delete(userId));
          poll.votes[index].add(userId);

          return interaction.reply({
            content: "✅ Vote updated!",
            flags: 64
          });
        }

        // =========================
        // ❌ CLOSE TICKET
        // =========================
        if (interaction.customId === 'ticket_close') {

          const channel = interaction.channel;

          const userId = [...activeTickets.entries()]
            .find(([_, ch]) => ch === channel.id)?.[0];

          if (userId) activeTickets.delete(userId);

          await interaction.reply({ content: "🔒 Closing ticket...", flags: 64 });

          setTimeout(() => {
            channel.delete().catch(() => {});
          }, 3000);
        }

      } catch (err) {
        console.error(err);
      }
    }

    // =========================
    // 🎟️ SELECT MENU (TICKET)
    // =========================
    if (interaction.isStringSelectMenu()) {

      if (interaction.customId === 'ticket_menu') {

        try {
          const type = interaction.values[0];
          const user = interaction.user;

          if (activeTickets.has(user.id)) {
            return interaction.reply({
              content: "❌ You already have an open ticket!",
              flags: 64
            });
          }

          const channel = await interaction.guild.channels.create({
            name: `ticket-${type}-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
              },
              {
                id: user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages
                ]
              }
            ]
          });

          activeTickets.set(user.id, channel.id);

          const embed = new EmbedBuilder()
            .setTitle(`🎫 ${type.toUpperCase()} TICKET`)
            .setColor("#57F287")
            .setDescription(
              `Hello ${user},\n\nSupport will assist you soon.\n\n📌 Type: **${type}**`
            )
            .setFooter({ text: "🔥 Powered by Zencraft" });

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_close')
              .setLabel('Close Ticket')
              .setStyle(ButtonStyle.Danger)
          );

          await channel.send({
            content: "@everyone",
            embeds: [embed],
            components: [row]
          });

          return interaction.reply({
            content: `✅ Ticket created: ${channel}`,
            flags: 64
          });

        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};
