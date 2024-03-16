const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Gender = sequelize.define('Gender', {
    id:{
        type: DataTypes.NUMBER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING 
    }
},
    {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    
}
); 
module.exports = Gender;
