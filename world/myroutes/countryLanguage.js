const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const {sequelize, countryLanguage} = require('../models');

router.get('/',(req,res)=> {
    const lang = req.body.language.split(',');
    const attribute = req.body.attribute.split(',');
    countryLanguage.findAll({
        attributes: attribute,
        where: {
            Language : { [Op.like] : lang }
        }
    }) .then(data=> {
        res.send(data);
    })
})

module.exports = router