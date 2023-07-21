module.exports = {
    name: 'embed',
    _base: function() {
        return new global.Discord.EmbedBuilder().setFooter({text: 'caltrop.dev/signal'}).setColor(0x2178DA);
    },

    info: function(description, title = 'Information') {
        return this._base().setDescription(description);
    },

    success: function(description, title = 'Success') {
        return this._base().addFields({ name: '☑️ ' + title, value: description });
    },

    invalid: function(description, title = 'Invalid Input', cmd, guildId) {
        if(cmd) description += '\n\n' + cmd.usage(guildId);
        return this._base().addFields({ name: '🚫 ' + title, value: description }).setColor(0xFB3131);
    },

    error: function(description = 'An Error occured while trying to process your request.\n\nConsider reporting this error [here](https://github.com/Caltrop256/signal-discord-r9k-bot/issues/new?assignees=&labels=&template=bug_report.md&title=)!', title = 'An Error occured') {
        return this._base().addFields({ name: '❗ ' + title, value: 'description' }).setColor(0xFF0000);
    }
}