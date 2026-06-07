require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];

// =======================
// LOAD COMMANDS
// =======================
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);

    if (!command.data) {
      console.log(`❌ Skipping ${file} (missing data)`);
      continue;
    }

    commands.push(command.data.toJSON());

    console.log(`✅ Loaded: ${command.data.name}`);
  } catch (err) {
    console.error(`❌ Error loading ${file}:`, err);
  }
}

// =======================
// REST CLIENT
// =======================
const rest = new REST({ version: '10' })
  .setToken(process.env.TOKEN);

// =======================
// DEPLOY GLOBAL COMMANDS
// =======================
(async () => {
  try {
    console.log(`🚀 Deploying ${commands.length} global commands...`);

    const data = await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID
      ),
      { body: commands }
    );

    console.log(
      `✅ Successfully deployed ${data.length} global commands.`
    );

  } catch (error) {
    console.error('❌ Deployment Error:', error);
  }
})();
