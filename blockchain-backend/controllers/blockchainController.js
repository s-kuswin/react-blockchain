const Blockchain = require('../models/blockchain');

// 初始化区块链实例
const blockchain = new Blockchain();
const defaultMinerAddress = 'cosmos1miner0000000000000000000000000000000000';
blockchain.addAccount(defaultMinerAddress, 0);

// 获取区块链高度
exports.getHeight = (req, res) => {
    res.json({ height: blockchain.getHeight() });
};

// 获取账户余额
exports.getBalance = (req, res) => {
    const { address } = req.params;
    const balance = blockchain.getBalance(address);
    res.json(balance);
};

// 提交交易到内存池
exports.submitTransaction = (req, res) => {
    try {
        const tx = req.body;
        const isSubmit =  blockchain.receiveTx(tx);
        console.log(isSubmit, '提价交易提示');
        res.json({ message: isSubmit ? '交易已提交到内存池' : '交易失败', code: isSubmit ? 200 : -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 挖矿出块
exports.mineBlock = async (req, res) => {
    try {
        const minerAddress = req.body.minerAddress || defaultMinerAddress;
        console.log(minerAddress, '挖矿中...');
        
        const block = await blockchain.mineBlock(minerAddress);
        if (block) {
            res.json({ message: `成功挖出区块 #${block.height}`, block });
        } else {
            res.status(400).json({ message: '内存池为空，无需挖矿' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 获取所有区块
exports.getBlocks = (req, res) => {
    res.json(blockchain.getBlocks());
};

// 获取最新区块
exports.getLatestBlock = (req, res) => {
    res.json(blockchain.getLatestBlock());
};

// 获取所有交易
exports.getTransactions = (req, res) => {
    res.json(blockchain.transactions);
};

// 获取内存池中的交易
exports.getMempool = (req, res) => {
    res.json(blockchain.mempool);
};


