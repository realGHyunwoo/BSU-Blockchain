const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const {sequelize, City} = require('../models');

router.get('/',(req,res)=> {
    const fields = req.query.fields.split (','); //query는 파라미터로 넘길때
    const type = req.query.type;
    City.findAll({
        // attributes:['name','population','District'],
        attributes: fields,
        where: {
            population: { [Op.lte]: 3000}, 
            District : { [Op.like]: "%k%"}
        },
//        limit: 1,
    }).then(data=> {
        if (type === 'json') //type이 json일때
        {
            if (1 < fields.length) //파라미터가 1개 초과일때
                res.json(data);
            else if (fields.length == 1) //파라미터가 1개 일때
            {
                let ret = [];
                data.forEach(dat=>{
                    ret.push(dat.getDataValue(fields[0]));
                })
                res.send(ret);
            }
        }
        else if (type === "text") //type이 text일때
        {
            let ret = [];
            data.forEach(dat=>{
                let txt = ""; //txt 변수를 string형으로 만들기
                for (let i = 0 ; i < fields.length ; i++)
                {
                    if (i != 0) txt += ",";
                    txt += dat.getDataValue(fields[i]);
                }
                ret.push(txt);
            })
            res.send(ret);
        }
    })
})

module.exports = router