module.exports = {
    name: 'clear',
    aliases: ['clr', 'reset'],
    args: '',
    rate: 30,
    perms: true,

    run: function(handler, msg, args, output) {
        client.misc.confirm(output, msg.member.id, 'You are about to reset the entire dataset!\nAre you sure you want to proceed?\n(**This action can NOT be undone**, use the '+client.guildInfo[msg.channel.guild.id].settings.prefix+'download command to create a backup)', 'Clear Dataset?')
        .then(proceed => {
            if(proceed) {
                client.sql.clearDataset(msg.channel.guild.id).then(() => {
                    output.send({embeds: [client.embed.success('Successfully cleared the entire dataset!', 'Dataset Cleared')]});
                }).catch(handler);
            }
        }).catch(handler);
    }
}