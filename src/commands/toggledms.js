module.exports = {
    name: 'toggledms',
    aliases: ['toggledm'],
    args: '',
    rate: 5,
    perms: true,

    run: async function(handler, msg, args, output) {
        const id = msg.member.id;
        if(client.ignoredUsers.has(id)) {
            client.ignoredUsers.delete(id);
            client.sql.deleteWhere('dontDM', 'userId', id);
            output.send({embeds: [client.embed.success('I will resume DMing you!', 'Enabled DM Notifications')]});
        } else {
            client.ignoredUsers.add(id);
            client.sql.addOptOutEntry(id);
            output.send({embeds: [client.embed.success('I will no longer DM you!', 'Disabled DM Notifications')]});
        }
    }
}