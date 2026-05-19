require('dotenv').config();

const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' })
  .setToken(process.env.TOKEN);

(async () => {

  try {

    console.log('🗑 Removing old global commands...');

    // REMOVE OLD GLOBAL COMMANDS
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log('✅ Old global commands removed.');

  } catch (err) {

    console.error(err);

  }

})();
