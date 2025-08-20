const Blockchain = require('../models/blockchain');
const { createWallet: createWalletModel, importWallet: importWalletModel } = require('../models/wallet');

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

// 创建钱包
exports.createWallet = async (req, res) => {
    try {
        const wallet = await createWalletModel();
        blockchain.addAccount(wallet.address, 100000000);
        res.json({
            mnemonic: wallet.mnemonic,
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 导入钱包
exports.importWallet = async (req, res) => {
    try {
        const { mnemonic } = req.body;
        if (!mnemonic) {
            return res.status(400).json({ error: '助记词不能为空' });
        }
        
        const wallet = await importWalletModel(mnemonic);
        
        // 如果账户不存在则添加
        if (!blockchain.accounts.has(wallet.address)) {
            blockchain.addAccount(wallet.address, 100000000);
        }
        
        res.json({
            address: wallet.address,
            publicKey: wallet.publicKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 提交交易到内存池
exports.submitTransaction = (req, res) => {
    try {
        const tx = req.body;
        blockchain.receiveTx(tx);
        res.json({ message: '交易已提交到内存池' });
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


