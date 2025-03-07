module.exports = {
    name: 'guildCreate',
    run: function(guild) {
        const promise = client.addGuild(guild.id);
        promise.then(async () => {
            function isValid(channel) {
                if(!channel) return false;
                const perm = channel.permissionsFor(guild.me);
                return perm.has('SEND_MESSAGES') && perm.has('VIEW_CHANNEL');
            }

            const channels = [
                await client.get.channel('signal', guild.id),
                await client.get.channel('r9k', guild.id),
                await client.get.channel('welcome', guild.id), 
                await client.get.channel('general', guild.id), 
                await client.get.channel('main', guild.id),
                ...Array.from(guild.channels.cache).map(c => c[1]).filter(c => c.type == 'text').sort((a,b) => a.position - b.position)
            ]

            for(let i = 0; i < channels.length; ++i) {
                if(isValid(channels[i])) {
                    const embed = {embeds: [client.embed.info('Thank you for adding me to your Guild!\nUse the **&channels** commands to start adding channels to the network! You can find a complete list of commands and further information [here](https://wonka.vision/sexo)')]}
                    channels[i].send(embed);
                    break;
                };
            }
        }).catch(console.error);
    }
}