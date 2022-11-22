const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const formatDuration = require('../../../structures/FormatDuration.js');

module.exports = {
  name: 'play',
  description: 'Play your favorite song/s.',
  category: 'Music',
  inVc: true,
  sameVc: true,
  options: [
    {
      name: 'query',
      description: 'Provide song name/url.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const player = client.poru.createConnection({
      guildId: interaction.guildId,
      voiceChannel: interaction.member.voice.channelId,
      textChannel: interaction.channel.id,
      deaf: true,
    });

    const song = interaction.options.getString('query');
    const resolve = await client.poru.resolve(song, 'spotify'); // You can remove 'spotify' for default Or change it to 'deezer' or 'apple' (currently maintenance).
    const { loadType, tracks, playlistInfo } = resolve;
    
    if (loadType === 'PLAYLIST_LOADED') {
      for (const track of resolve.tracks) {
        track.info.requester = interaction.member;
        await player.queue.add(track);
      }
      const track = tracks.shift();
      
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`**Added:** [${playlistInfo.name}](${song}) • \`${tracks.length}\` tracks • ${track.info.requester}`);

      await interaction.reply({ embeds: [embed] });
      if (!player.isPlaying && !player.isPaused) return player.play();
    } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
      const track = tracks.shift();
      
      track.info.requester = interaction.member;
      await player.queue.add(track);

      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`**Added:** [${track.info.title}](${track.info.uri}) • \`${formatDuration(track.info.length)}\` • ${track.info.requester}`);

      await interaction.reply({ embeds: [embed] });
      if (!player.isPlaying && !player.isPaused) return player.play();
    } else {
        
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`\`❌\` | No results found!`);
        
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
