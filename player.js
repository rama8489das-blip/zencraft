const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

module.exports = async (client) => {
    const player = new Player(client);

    await player.extractors.loadMulti(DefaultExtractors);

    client.player = player;

    console.log('🎵 Music Player Loaded');

    player.events.on('playerStart', (queue, track) => {
        console.log(`▶️ Now Playing: ${track.title}`);

        queue.metadata?.send({
            content: `🎵 Now Playing: **${track.title}**`
        }).catch(() => {});
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        console.log(`➕ Added: ${track.title}`);

        queue.metadata?.send({
            content: `➕ Added to Queue: **${track.title}**`
        }).catch(() => {});
    });

    player.events.on('audioTracksAdd', (queue, tracks) => {
        console.log(`➕ Playlist Added: ${tracks.length} tracks`);
    });

    player.events.on('disconnect', (queue) => {
        console.log(`🔌 Disconnected from ${queue.guild.name}`);
    });

    player.events.on('emptyChannel', (queue) => {
        console.log(`📭 Empty Channel: ${queue.guild.name}`);
    });

    player.events.on('emptyQueue', (queue) => {
        console.log(`📃 Queue Ended: ${queue.guild.name}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error('❌ Player Error:', error);
    });

    player.events.on('error', (queue, error) => {
        console.error('❌ Queue Error:', error);
    });

    player.events.on('debug', (queue, message) => {
        console.log('🐞 Debug:', message);
    });

    process.on('unhandledRejection', (reason) => {
        console.error('❌ Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('❌ Uncaught Exception:', err);
    });
};
