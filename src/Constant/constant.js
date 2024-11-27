const contractAddress = ""; 
const factoryAddress = ""; 
const tokenAddress = ""; 

const contractAbi = [];
const factoryAbi = [];
const erc20StandardAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    }
];

const erc20BurnableAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "account",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "burnFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const tokenAbi = [
    {
        "constant": true,
        "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "account", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "burnFrom",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "sender", "type": "address"},
            {"name": "recipient", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transferFrom",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];
const tokenOnlyAbi = [];

export {contractAbi, contractAddress,factoryAddress,factoryAbi,tokenAddress,tokenAbi};








