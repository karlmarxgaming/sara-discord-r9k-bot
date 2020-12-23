module.exports = {
    name: 'unmute',
    aliases: ['pardon'],
    args: '<user>',
    perms: ['MANAGE_GUILD'],

    run: async function(handler, msg, args, output) {
        if(!args.length) return output.send(client.embed.invalid('Please provide a user to unmute!', 'Invalid arguments', this, msg.channel.guild.id));
        const member = await client.get.member(args.join(" "), msg.channel.guild.id);
        if(!member) return output.send(client.embed.invalid('Could not find the provided user!', 'Unknown User'));
        const entry = client.guildInfo[msg.channel.guild.id].mutes[member.id];
        if(!entry || !entry.start) return output.send(client.embed.invalid(`${member} is not currently muted!`, 'User isn\'t muted'));
        client.guildInfo[msg.channel.guild.id].mutes[member.id] = {
            start: null,
            lastUpdate: entry.lastUpdate,
            time: null,
            streak: entry.streak
        }
        client.mute.unmuteUpdateChannelPerms(member.id, msg.channel.guild.id)
        .then(() => {
            client.mute.unmuteNotification(member.id, msg.channel.guild.id);
        }).catch(handler);
        client.sql('UPDATE `mutes` SET `start`=?,`lastUpdate`=?,`time`=?,`streak`='+entry.streak+' WHERE `userId`="'+member.id+'" AND `guildId`="'+msg.channel.guild.id+'";', [null, new Date(entry.lastUpdate), null, entry.streak])
        .then(() => {
            output.send(client.embed.success(`Successfully unmuted ${member}!`, 'Unmuted Member'));
        }).catch(handler);
    }
}