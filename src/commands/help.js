module.exports = {
    name: 'help',
    aliases: ['commands', 'cmds', ''],
    args: '',
    perms: false,
    
    run: function(handler, msg, args, output) {
        const embed = client.embed.info(`You can find a more detailed list of commands [here](https://wonka.vision/sexo/commands)`)
        embed.addFields( {name: 'List of commands', value: client.commands.map(c => `${client.guildInfo[msg.channel.guild.id].settings.prefix}**${c.name}** ${c.args}`).join('\n')});
        output.send({ embeds: [embed] });
    }
}