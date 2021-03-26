const express = require('express');
const router = express.Router();
const { User, sequelize } = require('../models');
const { Op } = require('sequelize')


// router.patch('/',async (req, res)=>{
//     let ret = [];
//     await User.update(
//         {comment: 'changed'},
//         {where: { id: 3}},

//     )
//     .then(data=>{
//         //res.send(JSON.stringify(data,2,4));
//         ret = data;
//     })
//     .catch(function(err) {
//         console.log(err);
//     })
//     res.json({ret: ret})
    
// })

// router.patch('/',async (req, res)=>{
//     let ret = [];
//     await User.update(
//         req.body[0],
//         req.body[1]

//     )
//     .then(data=>{
//         //res.send(JSON.stringify(data,2,4));
//         ret = data;
//     })
//     .catch(function(err) {
//         console.log(err);
//     })
//     res.json({ret: ret})
    
// })


router.delete('/',async (req, res)=>{
    let ret = [];
    await User.destroy(
        {where: { id: 3}},
    )
    .then(data=>{
        //res.send(JSON.stringify(data,2,4));
        ret = data;
    })
    .catch(function(err) {
        console.log(err);
    })
    res.json({ret: ret})
    
})

// router.get('/',async (req, res)=>{
//     let ret = [];
//     await User.findAll({
//         attributes:['name','age'],
//         where: {
//             married: 1,
//             age: { [Op.gt]:20 }
//         }
//     })
//     .then(data=>{
//         //res.send(JSON.stringify(data,2,4));
//         ret = data;
//     })
//     .catch(function(err) {
//         console.log(err);
//     })
//     res.json({ret: ret})
    
// })
router.get('/', (req, res)=>{
    let ret = [];
    sequelize.query("select * from comments")
    .then(([data])=>{
        //res.send(JSON.stringify(data,2,4));
        ret = data;
        res.json({ret: ret})
    })
    .catch(function(err) {
        console.log(err);
    })
   
    
})

router.post('/',(req,res)=> {
    const user = req.body;
    user.forEach(element => {
        User.create(
           element
        )
    });
   
  
    res.json({user:`${req.method} : ${req.url}`});
});

module.exports=router;