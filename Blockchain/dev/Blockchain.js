const sha256=require('sha256');
const currentNodeUrl = process.argv[3];
const {"v1":uuid} = require("uuid");
//Blockchain 생성자 함수
function Blockchain() {
    this.chain = []; //블록을 저장하는 배열
    this.newTransactions = []; 
    //블록에 포함되지 않은 트랜잭션 저장하는 배열
    this.createNewBlock(100,'0','0');
    this.currentNodeUrl=currentNodeUrl;
    //블록체인 참여 노드들의 URL을 저장하는 배열
    this.networkNodes =[];
}
// function block (nonce,prevBlockHash,hash,index) { //방법2
//     this.index=index;
//     this.timestamp=Date.now();
//     this.transactions=this.newTransactions;
//     this.nonce=nonce;
//     this.hash=hash;
//     this.prevBlockHash=prevBlockHash;
// }


//createNewBlock 메소드 구현
    //==>
Blockchain.prototype.createNewBlock=
    function(nonce,prevBlockHash,hash) {
        const newBlock = { //방법1
            index:this.chain.length+1,
            timestamp:Date.now(),
            transactions:this.newTransactions,
            nonce:nonce,
            hash:hash,
            prevBlockHash:prevBlockHash,
        }
        // const newBlock = new block(nonce,prevBlockHash,hash,this.chain.length+1); //방법2
        this.newTransactions=[];
        this.chain.push(newBlock);
        return newBlock;
}
Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length-1];
}
Blockchain.prototype.createNewTransaction = function(amount,sender,recipient) {
    const newTransaction = {
        amount : amount,
        sender : sender,
        recipient : recipient,
        transactionId: uuid().split('-').join('') //TXID 생성
    };
    return newTransaction;

}

//블록 생성부분
Blockchain.prototype.hashBlock=function(prevBlockHash,curBlockData,nonce) {
    //console.log(typeof nonce);
    const dataString = prevBlockHash 
    + nonce //nonce(숫자를) 스트링으로
    + JSON.stringify(curBlockData); //curBlock의 JSON 데이터를 스트링
    const hash=sha256(dataString);
    return hash;
}

Blockchain.prototype.proofOfWork = function(prevBlockHash,curBlockData) {
    let nonce = 1;
    let hash =this.hashBlock(prevBlockHash,curBlockData,nonce);
    while(hash.substring(0,4) !== "0000") {
        nonce++;
        hash = this.hashBlock(prevBlockHash,curBlockData,nonce);
        process.stdout.write(hash+"\r");

    }
    process.stdout.write("\n");
    return nonce;
}

Blockchain.prototype.addTransactionTonewTransactions=
function(transactionObj) {
    this.newTransactions.push(transactionObj);
    return this.getLastBlock()['index']+1;
}

Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain =true;
    //모든 블록을 순회하며 직전 블록의 해쉬값과 현재 블록의 해쉬값을 비교확인
    for (var i= 1; i< blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const preBlock = blockchain[i-1];
        const blockHash = this.hashBlock(preBlock['hash'],
        {  "transaction" : currentBlock['transactions'], "index" : currentBlock['index'] }, //hashBlock 파라미터의 현재블록부분
            currentBlock['nonce']); //hashBlock 파라미터의 nonce부분
        if(blockHash.substring(0,4) !=='0000') {
            validChain = false;
        }
        if(currentBlock['prevBlockHash'] !== preBlock['hash']) {
            validChain = false;
        }
    };
    
    //genesis블록 검증
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correcprevBlockHash = genesisBlock['prevBlockHash'] ==='0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length ===0;

    if(!correctNonce || !correcprevBlockHash|| !correctHash || !correctTransactions) {
        validChain=false;
    }

    return validChain;
}

Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash) {
            correctBlock=block;
        }
    });
    return correctBlock
}

Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransactions =null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.transactionId === transactionId) {
                correctTransactions = transaction;
                correctBlock=block;
            };
        });
    });
    return {
        transaction : correctTransactions ,
        block : correctBlock
    };
};

Blockchain.prototype.getAddressData = function(address) {
    const addressTransaction = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.sender === address || transaction.recipient === address) {
                addressTransaction.push(transaction);
            };
        });
    });
    
    let balance = 0;
    addressTransaction.forEach(transaction => {
        if(transaction.recipient === address) balance += transaction.amount; //돈 받을때
        else if (transaction.sender === address) balance -= transaction.amount; //돈 썻을때
    });
    return {
        addressTransaction: addressTransaction,
        addressBlance : balance
    };

};
module.exports = Blockchain;
