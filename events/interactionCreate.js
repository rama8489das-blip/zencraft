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
    // ✅ COMMAND HANDLER
    // =========================
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;

      try {
        await cmd.execute(interaction, client);
      } catch (error) {
        console.error('COMMAND ERROR:', error);

        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Error executing command' });
          } else {
            await interaction.reply({
              content: '❌ Error executing command',
              flags: 64
            });
          }
        } catch (err) {
          console.error('Reply failed:', err);
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
            try {
              return await interaction.reply({ content: "Giveaway ended!", flags: 64 });
            } catch {}
          }

          if (g.users.has(interaction.user.id)) {
            g.users.delete(interaction.user.id);
            try {
              return await interaction.reply({ content: "❌ You left the giveaway", flags: 64 });
            } catch {}
          } else {
            g.users.add(interaction.user.id);
            try {
              return await interaction.reply({ content: "✅ You joined the giveaway", flags: 64 });
            } catch {}
          }
        }

        // =========================
        // 📊 POLL SYSTEM
        // =========================
        if (interaction.customId.startsWith('poll_')) {

          const [_, pollId, index] = interaction.customId.split('_');
          const poll = client.polls.get(pollId);

          if (!poll || poll.ended) {
            try {
              return await interaction.reply({ content: "Poll ended!", flags: 64 });
            } catch {}
          }

          const userId = interaction.user.id;

          // remove previous votes
          Object.values(poll.votes).forEach(set => set.delete(userId));
          poll.votes[index].add(userId);

          try {
            return await interaction.reply({
              content: "✅ Vote updated!",
              flags: 64
            });
          } catch {}
        }

        // =========================
        // ❌ CLOSE TICKET
        // =========================
        if (interaction.customId === 'ticket_close') {

          const channel = interaction.channel;

          const userId = [...activeTickets.entries()]
            .find(([_, ch]) => ch === channel.id)?.[0];

          if (userId) activeTickets.delete(userId);

          try {
            await interaction.reply({ content: "🔒 Closing ticket...", flags: 64 });
          } catch {}

          setTimeout(() => {
            channel.delete().catch(() => {});
          }, 3000);
        }

      } catch (err) {
        console.error('BUTTON ERROR:', err);
      }

      return;
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
            try {
              return await interaction.reply({
                content: "❌ You already have an open ticket!",
                flags: 64
              });
            } catch {}
          }

          // ✅ SAFE CHANNEL NAME
          const safeName = `ticket-${type}-${user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');

          const channel = await interaction.guild.channels.create({
            name: safeName,
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

          try {
            return await interaction.reply({
              content: `✅ Ticket created: ${channel}`,
              flags: 64
            });
          } catch {}

        } catch (err) {
          console.error('TICKET ERROR:', err);
        }
      }
    }
  }
};
