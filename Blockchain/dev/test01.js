const Blockchain=require('./Blockchain');
const bitcoin=new Blockchain();

const bc1 =
{
    "chain": [
        {
            "index": 1,
            "timestamp": 1611903989084,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "preBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1611904064331,
            "transactions": [
                {
                    "amount": 10.2,
                    "sender": "Jake2",
                    "recipient": "Aoi2",
                    "transactionId": "a45c8160620011eb8dc78faf1e040b47"
                },
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "8251c0d0620011eb8dc78faf1e040b47",
                    "transactionId": "ac047f30620011eb8dc78faf1e040b47"
                }
            ],
            "nonce": 146454,
            "hash": "0000e19545f0102a6170537b96c8d0518ad0f6a8f8e36ef6a1a744788bebc3ea",
            "preBlockHash": "0"
        }
    ],
    "newTransactions": [],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
}

console.log("valid:", bitcoin.chainIsValid(bc1.chain));