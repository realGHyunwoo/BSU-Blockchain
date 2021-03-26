const Sequelize = require('sequelize');

module.exports = class City extends Sequelize.Model {
    static init(sequelize) {
        return super.init({    
            Name:{
                type : Sequelize.CHAR(35),
                allowNull : false, //not null옵션과 동일 false면 null을 허용x
                defaultValue: "", //default(기본값)을 의미
        },
            CountryCode: {
                type: Sequelize.CHAR(3),
                allowNull : false,
                defaultValue : "",
        },
            District: { 
                type: Sequelize.CHAR(20),
                allowNull : false,
                defaultValue: "",
            },
            Population: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            }
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'City',
            tableName: 'city',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    //static associate(db) {}
};