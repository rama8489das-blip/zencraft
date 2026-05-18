require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];

// =======================
// 🔥 LOAD COMMAND FILES
// =======================
const commandFiles = fs.readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

  try {

    const command = require(`./commands/${file}`);

    if (!command.data || !command.execute) {

      console.log(`❌ Skipping ${file}`);
      continue;

    }

    commands.push(command.data.toJSON());

    console.log(`✅ Loaded ${command.data.name}`);

  } catch (err) {

    console.error(`❌ Error in ${file}:`, err);

  }
}

// =======================
// 🔥 REST SETUP
// =======================
const rest = new REST({ version: '10' })
  .setToken(process.env.TOKEN);

// =======================
// 🚀 DEPLOY COMMANDS
// =======================
(async () => {

  try {

    console.log('🔄 Refreshing slash commands...');

    // 🔥 GUILD COMMANDS (INSTANT UPDATE)
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('✅ Slash commands refreshed instantly.');

  } catch (error) {

    console.error('❌ Deployment error:', error);

  }

})();
