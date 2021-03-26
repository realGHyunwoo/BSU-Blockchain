const morgan = require('morgan');
require('dotenv').config(); //dotenv환경변수 설정

const express = require('express');
const app = new express();

app.set('port',process.env.PORT || 4000);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended:false
}))