const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model { //model = sequelize에 있는 db관련함수를 사용하기 위함
    static init(sequelize) {
        return super.init({ //super = 상속받은곳에껄 사용할 수 있게함
            name: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            age: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull:false,
            },
            married: {
                type:Sequelize.BOOLEAN,
                allowNull:false,
            },
            comment : {
                type:Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type:Sequelize.DATE,
                allowNull:false,
                defaultValue:Sequelize.NOW,
            },
        },{
            sequelize,
            timestamps: false,
            underscored:false,
            modelName:'User',
            tableName:'users',
            paranoid: false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db) {
        db.User.hasMany(db.Comment, {foreignKey: 'commenter',sourceKey:'id'});
    }
;}