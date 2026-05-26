const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

// 🔒 STORE ACTIVE TICKETS
const activeTickets = new Map();

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {

    // =========================
    // ✅ SLASH COMMAND HANDLER
    // =========================
    if (interaction.isChatInputCommand()) {

      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {

        await command.execute(interaction, client);

      } catch (error) {

        console.error('COMMAND ERROR:', error);

        try {

          if (interaction.deferred || interaction.replied) {

            await interaction.editReply({
              content: '❌ Error executing command.'
            });

          } else {

            await interaction.reply({
              content: '❌ Error executing command.',
              flags: 64
            });

          }

        } catch (err) {
          console.error('REPLY ERROR:', err);
        }
      }

      return;
    }

    // =========================
    // 🔘 BUTTON HANDLER
    // =========================
    if (interaction.isButton()) {

      try {

        // =========================
        // ✅ VERIFY BUTTON
        // =========================
        if (interaction.customId === 'verify_button') {

          const verifyRoleId = '1507981501084729404';

          const verifyRole =
            interaction.guild.roles.cache.get(verifyRoleId);

          if (!verifyRole) {

            return interaction.reply({
              content: '❌ Verified role not found.',
              flags: 64
            });

          }

          // Already verified
          if (interaction.member.roles.cache.has(verifyRoleId)) {

            return interaction.reply({
              content: '✅ You are already verified.',
              flags: 64
            });

          }

          // Add verified role
          await interaction.member.roles.add(verifyRole);

          // Optional remove unverified role
          const unverifiedRole =
            interaction.guild.roles.cache.find(
              r => r.name === 'Unverified'
            );

          if (unverifiedRole) {

            await interaction.member.roles
              .remove(unverifiedRole)
              .catch(() => {});

          }

          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Verification Successful')
            .setDescription(
              `Welcome ${interaction.user}!\n\nYou now have access to the server.`
            )
            .setFooter({
              text: '🔥 Powered by Zencraft'
            });

          return interaction.reply({
            embeds: [embed],
            flags: 64
          });
        }

        // =========================
        // 🎉 GIVEAWAY JOIN
        // =========================
        if (interaction.customId === 'gw_join') {

          const giveaway =
            client.giveaways.get(interaction.message.id);

          if (!giveaway || giveaway.ended) {

            return interaction.reply({
              content: '❌ Giveaway ended!',
              flags: 64
            });

          }

          if (giveaway.users.has(interaction.user.id)) {

            giveaway.users.delete(interaction.user.id);

            return interaction.reply({
              content: '❌ You left the giveaway.',
              flags: 64
            });

          } else {

            giveaway.users.add(interaction.user.id);

            return interaction.reply({
              content: '✅ You joined the giveaway.',
              flags: 64
            });

          }
        }

        // =========================
        // 📊 POLL SYSTEM
        // =========================
        if (interaction.customId.startsWith('poll_')) {

          const [_, pollId, index] =
            interaction.customId.split('_');

          const poll = client.polls.get(pollId);

          if (!poll || poll.ended) {

            return interaction.reply({
              content: '❌ Poll ended!',
              flags: 64
            });

          }

          const userId = interaction.user.id;

          // Remove old votes
          Object.values(poll.votes).forEach(set => {
            set.delete(userId);
          });

          // Add new vote
          poll.votes[index].add(userId);

          return interaction.reply({
            content: '✅ Vote updated!',
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

          if (userId) {
            activeTickets.delete(userId);
          }

          await interaction.reply({
            content: '🔒 Closing ticket...',
            flags: 64
          });

          setTimeout(() => {

            channel.delete().catch(() => {});

          }, 3000);

          return;
        }

      } catch (error) {

        console.error('BUTTON ERROR:', error);

        try {

          if (!interaction.replied) {

            await interaction.reply({
              content: '❌ Button interaction failed.',
              flags: 64
            });

          }

        } catch {}

      }

      return;
    }

    // =========================
    // 🎟️ SELECT MENU HANDLER
    // =========================
    if (interaction.isStringSelectMenu()) {

      // =========================
      // 🎫 TICKET MENU
      // =========================
      if (interaction.customId === 'ticket_menu') {

        try {

          const type = interaction.values[0];
          const user = interaction.user;

          // Already has ticket
          if (activeTickets.has(user.id)) {

            return interaction.reply({
              content: '❌ You already have an open ticket!',
              flags: 64
            });

          }

          // Safe channel name
          const safeName =
            `ticket-${type}-${user.username}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '');

          // Create channel
          const channel =
            await interaction.guild.channels.create({

              name: safeName,
              type: ChannelType.GuildText,

              permissionOverwrites: [

                {
                  id: interaction.guild.id,
                  deny: [
                    PermissionsBitField.Flags.ViewChannel
                  ]
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

          // Store ticket
          activeTickets.set(user.id, channel.id);

          // Embed
          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`🎫 ${type.toUpperCase()} TICKET`)
            .setDescription(
              `Hello ${user},\n\nSupport will assist you soon.\n\n📌 Type: **${type}**`
            )
            .setFooter({
              text: '🔥 Powered by Zencraft'
            });

          // Close button
          const row =
            new ActionRowBuilder().addComponents(

              new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)

            );

          // Send ticket message
          await channel.send({
            content: `${user}`,
            embeds: [embed],
            components: [row]
          });

          // Reply
          return interaction.reply({
            content: `✅ Ticket created: ${channel}`,
            flags: 64
          });

        } catch (error) {

          console.error('TICKET ERROR:', error);

          try {

            if (!interaction.replied) {

              await interaction.reply({
                content: '❌ Failed to create ticket.',
                flags: 64
              });

            }

          } catch {}

        }
      }
    }
  }
};
