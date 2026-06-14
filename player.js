const { Player } = require('discord-player');

module.exports = async (client) => {

    const player = new Player(client);

    await player.extractors.loadDefault();

    player.events.on('playerStart', (queue, track) => {
        queue.metadata?.send({
            content: `🎵 Now Playing: **${track.title}**`
        });
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata?.send({
            content: `➕ Added to Queue: **${track.title}**`
        });
    });

    player.events.on('disconnect', (queue) => {
        console.log(`Disconnected from ${queue.guild.name}`);
    });

    player.events.on('emptyChannel', (queue) => {
        console.log(`Voice channel empty in ${queue.guild.name}`);
    });

    player.events.on('error', (queue, error) => {
        console.error(error);
    });

    client.player = player;

    console.log('🎵 Music Player Loaded');
};
