const express = require('express');
const Blockchain = require('./Blockchain');
var bitcoin = new Blockchain();
var app = new express();
const bodyparser = require('body-parser');
const {"v1":uuid} = require("uuid");
var nodeAddress = uuid().split('-').join('');
// "nodemon --watch dev -e js<여기까지가 argv[0] dev/api.js<argv[1] 3000<argv[2]" 
const port = process.argv[2]; 
const reqp = require('request-promise');
const requestPromise = require('request-promise');


//bodyparser 사용하기위함 => post로 보내면 body에 json raw값을 읽을수 있는 json으로 변환
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

app.get('/',function(req,res){
    res.send("Hello World!");
})
app.get('/blockchain',function(req,res){ //전체 블록체인 가지고 와서 그 안의 데이터 조회
    res.send(bitcoin);
});
app.post('/transaction',function(req,res){ //새로운 트랜잭션 생성
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionTonewTransactions(newTransaction);
    res.json({note:`Transaction will be added in block ${blockIndex}.`});
}); 

app.post('/mine',function(req,res){ //새로운 블록 생성
    const lastBlock = bitcoin.getLastBlock();
    const prevBlockHash = lastBlock['hash'];
    //코인베이스 트랜잭션 : 채굴에 성공하면 발신자가 00인 트랜잭션 생성
    bitcoin.newTransactions.push(bitcoin.createNewTransaction(12.5,"00",nodeAddress));
    
    //swap
    let a= (bitcoin.newTransactions.length)-1;
    let temp = bitcoin.newTransactions[0];
    bitcoin.newTransactions[0] = bitcoin.newTransactions[a];
    bitcoin.newTransactions[a] =temp;

    const curBlockData = {
        transaction : bitcoin.newTransactions,
        index: lastBlock['index'] +1
    };
    const nonce = bitcoin.proofOfWork(prevBlockHash,curBlockData); //pow, nonce값 찾고
    const blockHash = bitcoin.hashBlock(prevBlockHash,curBlockData,nonce); //현재 블록 hash : 블록 생성 파라미터로 바로 쓰기위해
    //파라미터: amount,sender,recipient
    const newBlock = bitcoin.createNewBlock(nonce,prevBlockHash,blockHash); //블록 생성
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=> {
        const requestOption= {
            uri: networkNodeUrl + '/receive-new-block',
            method : 'POST',
            body : { newBlock:newBlock},
            json : true
        };
        requestPromise.push(reqp(requestOption));
    });
    
    Promise.all(requestPromise)
    .then(data=> {
        res.json({
            note: 'New block mined & broadcast successfully',
            block : newBlock
        }); 
    
});
    //새로운 블록을 다른 노드에게 통지
    res.json({ note: "New block mined successfully", block:newBlock });
   
}); 

//신규노드가 req시 실행 신규노드를 다른노드에게 브로드 캐스팅하고 자신의 정보를 신규노드에게 줌(bulk)
app.post('/register-and-broadcast-node', function(req,res){
    const newNodeUrl = req.body.newNodeUrl; 
    //networkNodes 배열에 없으면 추가
    if(bitcoin.networkNodes.indexOf(newNodeUrl)== -1) //indexOf 함수의 리턴값이 -1이면 배열에 없다는 의미
    {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    const regNodesPromises=[];
    //다른 노드에게 브로드 캐스팅
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl:newNodeUrl},
            json:true
        };
        regNodesPromises.push(reqp(requestOption));
    });
    Promise.all(regNodesPromises) //promise 객체들을 비동기 실행
    .then(data=> {
        const bulkRegisterOptions = { //신규 노드에게 벌크해줌
            uri:newNodeUrl + '/register-nodes-bulk',
            method:'POST',
            body:{allNetworkNodes: [...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
            json: true
        };
        return reqp(bulkRegisterOptions)
    });
    res.json({note: 'New node registered successfully'});
});
//다른 노드로 부터 특정 노드를 추가요청이 오는 코드
app.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    //자신의 networkNodes배열에 추가요청 노드가 있는지 확인하는 부분 없으면 true
    const nodeNotExist = (bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    //자신의 주소면 false 자신의 주소가 아니면 true
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotExist && notCurrentNode) {
        //자신의 networkNodes에 없고 자신의 주소도 아니면 추가
        bitcoin.networkNodes.push(newNodeUrl);
    }
    //등록요청에 대한 회신
    res.json({note: 'New node registered successfully'});
});
//자신이 알고있는 노드의 정보를 신규 노드에게 전송
app.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=> {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl)==-1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) {
            bitcoin.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({note: 'Bulk registration successful'});
});
app.post('/transaction/broadcast',function(req, res){
    const newTransaction = bitcoin.createNewTransaction (req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionTonewTransactions(newTransaction);
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromise.push(reqp(requestOption));
    });
    Promise.all(requestPromise)
    .then(data => {
        res.json({note: 'Transaction created and boradcast successfully'})
    });
});
app.post('/receive-new-block', function(req,res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.prevBlockHash;
    const correctIndex = lastBlock['index']+1 === newBlock['index'];

    if(correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.newTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock:newBlock
        });
    }
    else {
        res.json({
            note: 'New block rejected',
            newBlock:newBlock
        });
    }
});
app.get('/consensus', function(req,res) {
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption= {
            uri : networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true 
        };

        requestPromise.push(reqp(requestOption));
    });
    Promise.all(requestPromise)
    .then(Blockchain=> {
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newTransaction = null;

        //가장 긴 블록체인 탐색
        Blockchain.forEach(blockchain => {
            if(blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newTransaction = blockchain.newTransaction;
            };
        });
        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            res.json({
                note: "Current chain has not been replaced",
                chain: bitcoin.chain
            });
        }
        else {
            bitcoin.chain = newLongestChain;
            bitcoin.newTransaction = newTransaction;
            res.json({
                note: "This chain has been replaced",
                chain: bitcoin.chain
            });
        }
    }); 
});
//블록 해쉬 주면 블록리턴
app.get('/block/:blockHash', function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        "block" : correctBlock
    });
});
//txid주면 트랜잭션 리턴
app.get('/transaction/:transactionId',function(req,res) {
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});
app.get('/address/:address',function(req,res){
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData: addressData
    });
});
app.get('/block-explorer',function(req,res) {
    res.sendFile('/block-explorer/index.html', {root:__dirname});
});

app.listen(port,function(){
    console.log(`listening on port ${port}..... `)
});

