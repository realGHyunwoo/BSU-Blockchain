const express = require('express');
const app = express();
const morgan = require('morgan');

const myroutes = require('./myroutes');
const myroutescity = require('./myroutes/city');
const myroutescountryLanguage = require('./myroutes/countryLanguage');

const {sequelize}=require('./models');
sequelize.sync({force:false})
.then(()=>{console.log("데이터베이스 연결 성공");})
.catch((err)=>{console.log(err)});

app.set('port', 4000);

app.use(morgan('dev'));
app.use(express.json()); //json parse
app.use(express.urlencoded({extended:false})); //json parse
app.use('/', myroutes);
app.use('/city', myroutescity);
app.use('/countryLanguage',myroutescountryLanguage);

app.listen(app.get('port'), ()=>{
    console.log('Waiting to connect...')
});
