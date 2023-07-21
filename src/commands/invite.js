module.exports = {
    name: 'invite',
    aliases: ['inv'],
    args: '',
    perms: false,

    run: function(handler, msg, args, output) {
        const permissions = 268807184;
        const inviteLink = 'https://discord.com/api/oauth2/authorize?client_id='+client.user.id+'&permissions='+permissions+'&scope=bot'
        output.send({embeds: [client.embed.info('[Click here]('+inviteLink+') to invite me to your guild!', 'Invite Link')]});
    }
}