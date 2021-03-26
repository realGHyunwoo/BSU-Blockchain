const express = require('express');
const Blockchain = require('./Blockchain');
var bitcoin = new Blockchain();
var app = new express();
const bodyparser = require('body-parser');
const {"v1":uuid} = require("uuid");
var nodeAddress = uuid().split('_').join('');
bitcoin.createNewTransaction(1.2,"test",nodeAddress);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

app.get('/',function(req,res){
    res.send("Hello World!");
})
app.post('/blockchain',function(req,res){ //전체 블록체인 가지고 와서 그 안의 데이터 조회
    res.send(bitcoin);
});
app.post('/transaction',function(req,res){ //새로운 트랜잭션 생성
    const blockIndex = bitcoin.createNewTransaction(
            req.body.amount,
            req.body.sender,
            req.body.recipient)
        res.json({note: `Transaction will be added in block ${blockIndex}`});
}); 
app.post('/mine',function(req,res){ //새로운 블록 생성
    const lastBlock = bitcoin.getLastBlock();
    const preBlockHash = lastBlock['hash'];
    const curBlockData = {
        transaction : bitcoin.newTransactions,
        index: lastBlock['index'] +1
    };
    const nonce = bitcoin.proofOfWork(preBlockHash,curBlockData); //pow, nonce값 찾고
    const blockHash = bitcoin.hashBlock(preBlockHash,curBlockData,nonce); //현재 블록 hash : 블록 생성 파라미터로 바로 쓰기위해
    //코인베이스 트랜잭션 : 채굴에 성공하면 발신자가 00인 트랜잭션 생성
    //파라미터: amount,sender,recipient
    bitcoin.createNewTransaction(12.5,"00",nodeAddress);
    const newBlock = bitcoin.createNewBlock(nonce,preBlockHash,blockHash); //블록 생성
    
    //새로운 블록을 다른 노드에게 통지
    res.json({ note: "New block mined successfully", block:newBlock });
   
}); 

app.listen(3000,function(){console.log("listening on port 3000......")});
