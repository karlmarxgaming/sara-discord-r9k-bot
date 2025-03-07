module.exports = {
    name: 'mute',
    aliases: ['warn', 'addviolation', 'addv'],
    args: '<user>',
    perms: true,

    run: async function(handler, msg, args, output) {
        if(!args.length) return output.send({embeds: [client.embed.invalid('Please provide a user to mute!', 'Invalid arguments', this, msg.channel.guild.id)]});
        const member = await client.get.member(args.join(" "), msg.channel.guild.id);
        if(!member) return output.send({embeds: [client.embed.invalid('Could not find the provided user!', 'Unknown User')]});
        const entry = client.guildInfo[msg.channel.guild.id].mutes[member.id];
        const now = new Date();
        const newEntry = {
            start: +now,
            lastUpdate: +now,
            streak: Math.min(entry ? entry.streak + 1 : 1, client.mute.MAX_STREAK)
        };
        newEntry.time = Math.min(Math.pow(client.mute.defaultBaseDurationS, newEntry.streak) * 1000, client.mute.MAX_MUTE_TIME);
        client.guildInfo[msg.channel.guild.id].mutes[member.id] = Object.assign({}, newEntry);
        client.mute.muteUpdateChannelPerms(member.id, msg.channel.guild.id)
        .then(() => {
            client.mute.muteNotification(member.id, msg.channel.guild.id, newEntry.time, msg.author.id);
        }).catch(handler);
        client.sql.updateMuteEntry(msg.channel.guild.id, member.id, now, now, newEntry.streak, newEntry.time).then(() => {
            output.send({embeds: [client.embed.success(`Successfully muted ${member}\n\nThey will be unmuted in **${client.time(newEntry.time)}**!`, 'User muted')]});
        }).catch(handler);
    }
}