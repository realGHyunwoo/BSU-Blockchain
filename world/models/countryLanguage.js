const Sequelize = require('sequelize');

module.exports = class CountryLanguage extends Sequelize.Model {
    static init(sequelize) {
        return super.init({    
            CountryCode:{
                type : Sequelize.CHAR(3),
                allowNull : false, //not null옵션과 동일 false면 null을 허용x
                defaultValue: "", //default(기본값)을 빈 문자열
                primaryKey:true,
            },
            Language: {
                type: Sequelize.CHAR(30),
                allowNull : false,
                defaultValue : "",
                primaryKey:true,
            },
            IsOfficial : {
                type : Sequelize.ENUM('t','f'),
                allowNull : false,
                defaultValue : 'f',
            
            },
            Percentage : {
                type: Sequelize.FLOAT(4,1),
                allowNull:false,
                defaultValue : 0.0,

            }
        },  {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'CountryLanguage',
                tableName: 'countryLanguage',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            
            });
        }
        //static associate(db) {}
    };