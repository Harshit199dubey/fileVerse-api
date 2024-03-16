const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Maritalstatus = sequelize.define('maritalstatu', {
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
module.exports = Maritalstatus;
