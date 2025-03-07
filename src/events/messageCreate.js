
module.exports = {
    name: 'messageCreate',
    run: async function (msg) {
        if(msg.author.id == client.user.id) return;

        if(client.guildInfo[msg.channel.guild.id].channels.has(msg.channel.id)) {
            try {
                let valid = false;

                if(msg.content.length) {
                    const comp = await client.compressData(msg.content)

                    if(comp.length > 2000) return client.error.handler(
                        null, 
                        msg.author.id,
                        msg.channel.guild.id,
                        Date.now(),
                        new TypeError('Compressed data exceeds 2000 char limit!')
                    );

                    const messageIsUnique = await client.sql.checkAndAppendMessageData(msg.channel.guild.id, comp);
                    if(messageIsUnique) valid = true;
                }

                if(msg.attachments.size || msg.embeds.length) {
                    const hashed = await Promise.all([...msg.attachments.map(client.compressData), ...msg.embeds.map(client.compressData)]),
                        gId = msg.channel.guild.id;

                    const includesUniqueHash = await client.sql.checkAndAppendAttributeDataArray(gId, hashed);
                    if(includesUniqueHash) valid = true;
                }

                if(!valid) {
                    msg.delete();
                    if(client.guildInfo[msg.channel.guild.id].settings.muteOnViolation && !msg.author.bot) {
                        client.mute.apply(msg.author.id, msg.channel.guild.id);
                    }
                } else evaluateCommand();
            } catch(e) {
                console.error(e);
            }
        } else evaluateCommand();

        async function evaluateCommand() {
            if(msg.author.bot) return;
            const prefix = client.guildInfo[msg.channel.guild.id].settings.prefix;
            var usedPrefix = '';
            const availablePrefixes = [prefix, '-' + prefix, '<@'+client.user.id+'>', '<@!' + client.user.id + '>', '<@'+client.user.id+'> ', '<@!' + client.user.id + '> '];
            const deleteOp = msg.content.startsWith('-' + prefix);

            for(let i = 0; i < availablePrefixes.length; ++i) {
                if(msg.content.startsWith(availablePrefixes[i])) {
                    usedPrefix = availablePrefixes[i];
                    break;
                }
            }

            if(deleteOp || usedPrefix) {
                const full = msg.content.substring(usedPrefix.length).trim(),
                    split = full.split(/ +/g),
                    cmdName = split[0].toLowerCase(),
                    args = split.slice(1),
                    output = deleteOp ? msg.author : msg.channel;
                let cmd = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
    
                if(!cmd) {
                    const mostSimilar = client.commands.map((c) => [c, Math.max(client.misc.similarity(cmdName, c.name), ...c.aliases.map(a => client.misc.similarity(cmdName, a)))]).sort((a,b) => b[1] - a[1])[0];
                    if(!mostSimilar || mostSimilar[1] < 0.6) return output.send({embeds: [client.embed.invalid('Couldn\'t find that command.\n\nUse **' + client.guildInfo[msg.channel.guild.id].settings.prefix + 'help** to see a list of all commands!', 'Unknown Command')]});
                    if(await client.misc.confirm(output, msg.author.id, `Did you mean **${prefix}${mostSimilar[0].name}**?`, 'Unknown Command')) {
                        cmd = mostSimilar[0];
                    } else return;
                };

                let hasPerms
                client.guildInfo[msg.channel.guild.id].roles.forEach(role => {
                    if(msg.member.roles.cache.has(role)) hasPerms = true
                });

                if(msg.author.id == msg.guild.ownerId) {
                    hasPerms = true}
                console.log(`user: ${msg.member.id} hasperms: ${hasPerms}`);
                if(cmd.perms && !hasPerms){
                    return output.send({embeds: [client.embed.invalid('You need permissions to use this command!', 'Invalid Permissions')]})
                }       
                  
                if(cmd.rate) {
                    const timestamp = cmd.cooldown.get(msg.author.id);
                    if(timestamp) {
                        const remaining = Date.now() - timestamp,
                            duration = cmd.rate * 1000;
                        if(remaining > duration) cmd.cooldown.delete(msg.author.id);
                        else return output.send({embeds: [client.embed.invalid(`Please wait another **${(Math.abs(remaining - duration) / 1000).toFixed(1)}s** before running this command again!`, 'Command Cooldown')]});
                    } else cmd.cooldown.set(msg.author.id, Date.now());
                }

                const handler = client.error.handler.bind(null, output, msg.author.id, msg.channel.guild.id, Date.now());
                
                try {
                    cmd.run(handler, msg, args, output);
                    if(deleteOp) msg.delete();
                } catch(e) {
                    handler(e);
                }
            }
        }
    }
}