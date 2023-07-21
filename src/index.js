const {ShardingManager} = require('discord.js'),
    mysql2 = require('mysql2'),
    query = require('fs').readFileSync('./setup.sql', {encoding: 'utf8'}),
    config = require('./config.json');

const manager = new ShardingManager('./client.js', {
    token: config.token,
    totalShards: 'auto',
    shardList: 'auto',
    mode: 'process',
    respawn: true
});
manager.on('shardCreate', shard => console.log(`Shard ${shard.id} launched!`));

const connection = mysql2.createConnection(Object.assign({multipleStatements: true}, config.mySQL));
connection.query(query, function(err) {
    if(err) throw err;
    manager.spawn();
    connection.end();
});