'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    fbid: DataTypes.STRING,
    name: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthday: DataTypes.STRING,
    hometown: DataTypes.STRING,
    photo: DataTypes.STRING,
    profileURL: DataTypes.STRING,
    email: DataTypes.STRING,
    socket_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return user;
};