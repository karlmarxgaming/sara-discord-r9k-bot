module.exports = {
    name: 'channels',
    aliases: ['ch', 'channel', 'network', 'networks'],
    args: '[add|remove] [channel]',
    perms: true,

    run: async function(handler, msg, args, output) {
        const guild = msg.channel.guild;

        if(!args.length) {
            output.send({ embeds: [ client.embed.info(client.misc.endListWithAnd(Array.from(client.guildInfo[msg.channel.guild.id].channels).map(c => '<#' + c + '>')) || 'No roles added yet!\n\nUse **' + client.guildInfo[msg.channel.guild.id].settings.prefix + 'roles add <role>** to start adding channels to the list!', 'List of role')]});
        } else if(args.length >= 2) {
            const str = args.join(' ').substring((args[0].length)).trim();
            var channel = null;
            switch(args[0].toLowerCase()) {
                case 'add':
                case 'a':
                case 'connect':
                case 'c':
                    channel = await client.get.channel(str, guild.id);
                    if(!channel) {
                        return output.send({embeds: [client.embed.invalid(`Couldn't find specified channel!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    if(client.guildInfo[guild.id].channels.has(channel.id)) {
                        return output.send({embeds: [client.embed.invalid(`The ${channel} channel has already been added to the network!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    client.guildInfo[guild.id].channels.add(channel.id);
                    for(const userId in client.guildInfo[guild.id].mutes) {
                        client.mute.muteUpdateChannelPerms(userId, guild.id).catch(console.error);
                    }
                    client.sql.addChannel(guild.id, channel.id).then(() => {
                        output.send({embeds: [client.embed.success(`The ${channel} channel has been added to the network!`, 'Success!')]});
                    }).catch(console.error);
                    break;
                case 'remove':
                case 'r':
                case 'disconnect':
                case 'd':
                    channel = await client.get.channel(str, guild.id);
                    if(!channel) {
                        return output.send({embeds: [client.embed.invalid(`Couldn't find specified channel!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    if(!client.guildInfo[guild.id].channels.has(channel.id)) {
                        return output.send({embeds: [client.embed.invalid(`The ${channel} channel is not part of the network yet!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    //if(!(await client.misc.confirm(output, msg.member.id, `Are you sure you want to remove ${channel} from the network?`))) return;
                    client.guildInfo[guild.id].channels.delete(channel.id);
                    for(const userId in client.guildInfo[guild.id].mutes) {
                        const member = await guild.members.fetch(userId)
                        channel.permissionOverwrites.edit(member, client.mute.unmuteObj).then(updCh => {
                            const perm = updCh.permissionOverwrites.get(userId);
                            if(perm && !perm.allow.bitfield && !perm.deny.bitfield) perm.delete().catch(console.error);
                        }).catch(console.error);
                    }
                    client.sql.deleteChannel(guild.id, channel.id).then(() => {
                        output.send({embeds: [client.embed.success(`The ${channel} channel has been removed from the network!`, 'Success!')]});
                    }).catch(console.error);
                    break;
                default :
                    output.send({embeds: [client.embed.invalid(`Invalid action, use either **add** or **remove**`, 'Invalid arguments', this, msg.channel.guild.id)]});
            }
        } else output.send({embeds: [client.embed.invalid(`Invalid amount of arguments`, 'Invalid arguments', this, msg.channel.guild.id)]});
    }
}