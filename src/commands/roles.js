module.exports = {
    name: 'roles',
    aliases: ['role', 'ro'],
    args: '[add|remove] [channel]',
    perms: true,

    run: async function(handler, msg, args, output) {
        const guild = msg.channel.guild;

        if(!args.length) {
            output.send({ embeds: [ client.embed.info(client.misc.endListWithAnd(Array.from(client.guildInfo[msg.channel.guild.id].roles).map(c => '<@&' + c + '>')) || 'No channels added yet!\n\nUse **' + client.guildInfo[msg.channel.guild.id].settings.prefix + 'channel add <channel>** to start adding channels to the list!', 'List of Channels')]});
        } else if(args.length >= 2) {
            const str = args.join(' ').substring((args[0].length)).trim();
            var channel = null;
            switch(args[0].toLowerCase()) {
                case 'add':
                case 'a':
                    role = await client.get.role(str, guild.id);
                    if(!role) {
                        return output.send({embeds: [client.embed.invalid(`Couldn't find specified channel!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    if(client.guildInfo[guild.id].roles.has(role.id)) {
                        return output.send({embeds: [client.embed.invalid(`The ${role} channel has already been added to the network!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    client.guildInfo[guild.id].roles.add(role.id);

                    client.sql.addRole(guild.id, role.id).then(() => {
                        output.send({embeds: [client.embed.success(`The ${role} channel has been added to the network!`, 'Success!')]});
                    }).catch(console.error);
                    break;
                case 'remove':
                case 'r':
                    role = await client.get.role(str, guild.id);
                    if(!role) {
                        return output.send({embeds: [client.embed.invalid(`Couldn't find specified channel!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    if(!client.guildInfo[guild.id].roles.has(role.id)) {
                        return output.send({embeds: [client.embed.invalid(`The ${channel} channel is not part of the network yet!`, 'Invalid Channel', this, msg.channel.guild.id)]});
                    }
                    //if(!(await client.misc.confirm(output, msg.member.id, `Are you sure you want to remove ${channel} from the network?`))) return;
                    client.guildInfo[guild.id].roles.delete(channel.id);
                    
                    client.sql.deleteRole(guild.id, role.id).then(() => {
                        output.send({embeds: [client.embed.success(`The ${channel} channel has been removed from the network!`, 'Success!')]});
                    }).catch(console.error);
                    break;
                default :
                    output.send({embeds: [client.embed.invalid(`Invalid action, use either **add** or **remove**`, 'Invalid arguments', this, msg.channel.guild.id)]});
            }
        } else output.send({embeds: [client.embed.invalid(`Invalid amount of arguments`, 'Invalid arguments', this, msg.channel.guild.id)]});
    }
}