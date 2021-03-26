const Sequelize = require('sequelize');

const City = require('./city') //city테이블을 사용하기 위해 1
const countryLanguage = require('./countryLanguage') //테이블 셋팅

const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env];
const db={};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize=sequelize;

db.City=City; //city테이블을 사용하기 위해 2
City.init(sequelize); //city테이블을 사용하기 위해 3

db.countryLanguage = countryLanguage;
countryLanguage.init(sequelize);

module.exports = db;