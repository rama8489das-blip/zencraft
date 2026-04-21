require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];

// 🔥 LOAD COMMAND FILES
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);

    if (!command.data) {
      console.log(`❌ Skipping ${file} (no data)`);
      continue;
    }

    commands.push(command.data.toJSON());
    console.log(`✅ Loaded ${file}`);
  } catch (err) {
    console.error(`❌ Error in ${file}:`, err.message);
  }
}

// 🔥 REST SETUP
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🔥 DEPLOY
(async () => {
  try {
    console.log('🚀 Deploying commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Commands deployed successfully');
  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
})();
