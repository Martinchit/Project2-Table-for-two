const sequelize = require('sequelize');

const connection = new sequelize('Project', 'MartinChin', 'password', {
    dialect: 'postgres'
});

const Table = connection.define('User', {
    fbid : sequelize.STRING,
    name : sequelize.STRING,
    firstName : sequelize.STRING,
    lastName: sequelize.STRING,
    gender : sequelize.STRING,
    birthday : sequelize.STRING,
    hometown : sequelize.STRING,
    photo : sequelize.STRING,
    profileURL : sequelize.STRING,
    email : sequelize.STRING,
    socket_id : sequelize.STRING
});

// Table.sync({force : true});

module.exports.table = Table;