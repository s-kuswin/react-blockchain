const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const EC = require('elliptic');

const ec = new EC.ec('secp256k1');

// 区块链核心类
class Blockchain {
    constructor() {
        this.accounts = new Map(); // 存储公钥地址和余额
        this.chainId = 'mock-chain-1';
        this.height = 0;
        this.blockTime = Date.now();
        this.transactions = []; // 已确认交易
        this.blocks = [];
        this.mempool = []; // 待处理交易池
    }

    addAccount(address, amount = 100000000) {
        this.accounts.set(address, amount);
        console.log(`🏦 已创建账户 ${address}，初始余额: ${amount}`);
    }

    getBalance(address, denom = 'token') {
        return {
            amount: (this.accounts.get(address) || 0).toString(),
            denom: denom,
        };
    }

    // 验证交易签名
    verifyTransaction(tx) {
        console.log('verifyTransaction', tx);
        // 检查必要字段
        if (!tx.from || !tx.to || !tx.amount || !tx.signature) {
            return false;
        }
        
        // 检查发送方是否有足够余额
        const fromBalance = this.accounts.get(tx.from) || 0;

        const sendAmount = parseInt(tx.amount);

        if (fromBalance < sendAmount) {
            return false;
        }
        
        // 验证数字签名
        return this.verifySignature(tx);
    }

    // 验证交易签名的具体实现
    verifySignature(tx) {
        try {
            // 重构交易对象以排除签名字段
            const { signature, publicKey, ...txWithoutSignature } = tx;
            const txData = JSON.stringify(txWithoutSignature);
            
            // 检查是否有公钥
            if (!publicKey) {
                console.error('交易缺少公钥');
                return false;
            }
            console.log(txData, publicKey, signature)
            // 使用公钥验证签名
            const keyPair = ec.keyFromPublic(publicKey, 'hex');
            const verified = keyPair.verify(txData, signature);
            
            return verified;
        } catch (error) {
            console.error('签名验证错误:', error);
            return false;
        }
    }

    // SHA-256 哈希函数实现
    sha256(message) {
        return CryptoJS.SHA256(message).toString();
    }

    sendTokens(tx) {
        // 验证交易
        if (!this.verifyTransaction(tx)) {
            throw new Error('❌ 交易验证失败');
        }

        const fromBalance = this.accounts.get(tx.from) || 0;
        const sendAmount = parseInt(tx.amount);

        this.accounts.set(tx.from, fromBalance - sendAmount);
        this.accounts.set(tx.to, (this.accounts.get(tx.to) || 0) + sendAmount);

        // 生成交易哈希
        const txData = JSON.stringify({
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            denom: tx.denom || 'token',
            timestamp: tx.timestamp,
            signature: tx.signature
        });
        const txHash = this.sha256(txData);
        
        const transaction = {
            hash: txHash,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            denom: tx.denom || 'token',
            timestamp: tx.timestamp,
            signature: tx.signature
        };
        
        this.transactions.push(transaction);

        console.log(`✅ 转账成功: ${tx.from} → ${tx.to}, ${tx.amount} ${tx.denom || 'token'}`);
        return {
            transactionHash: txHash,
            height: ++this.height,
            code: 0,
            log: 'Tx successfully executed',
        };
    }

    getHeight() {
        return this.height;
    }

    getLatestBlock() {
        return {
            header: {
                height: this.height,
                chainId: this.chainId,
                time: new Date(this.blockTime + this.height * 7000).toISOString(),
            },
            numTxs: 0,
            data: [],
        };
    }
    
    getBlocks() {
        return this.blocks;
    }
    
    addBlock(block) {
        this.blocks.push(block);
    }
    
    // 接收交易到内存池
    receiveTx(tx) {
        // 验证交易格式
        console.log(`⛏️  矿工收到交易: ${tx.from} → ${tx.to}`, tx)
        if (!tx.from || !tx.to || !tx.amount || !tx.signature) {
            console.log(`❌ 交易格式无效`);
            return false
        }

        if(!this.verifyTransaction(tx)) return false;
        
        this.mempool.push(tx);
        console.log(`⛏️  收到交易: ${tx.from} → ${tx.to}`);
        return true
    }

    // 打包交易并出块
    async mineBlock(minerAddress) {
        console.log(`⛏️  正在打包 ${this.mempool.length} 笔交易...`);

        // 处理所有交易
        const validTransactions = [];
        for (const tx of this.mempool) {
            try {
                // 验证交易
                if (this.verifyTransaction(tx)) {
                    this.sendTokens(tx);
                    validTransactions.push(tx);
                } else {
                    console.error(`❌ 交易验证失败: ${tx.from} → ${tx.to}`);
                }
            } catch (error) {
                console.error(`❌ 交易执行失败: ${error.message}`);
            }
        }

        // 给矿工发奖励（即使没有交易也要发放）
        // 创建一个特殊的奖励交易
        const rewardAmount = 50 + validTransactions.length * 10; // 基础奖励50 + 每个交易额外奖励10
        const currentBalance = this.accounts.get(minerAddress) || 0;
        this.accounts.set(minerAddress, currentBalance + rewardAmount);

        // 创建奖励交易记录
        const rewardTx = {
            hash: this.sha256(`reward-${minerAddress}-${Date.now()}-${uuidv4()}`),
            from: 'network',
            to: minerAddress,
            amount: rewardAmount.toString(),
            denom: 'token',
            timestamp: Date.now(),
            signature: 'reward_signature',
            isReward: true // 特殊标志，标识这是奖励交易
        };

        // 将奖励交易添加到已确认交易列表中
        this.transactions.push(rewardTx);

        // 清空内存池中已处理的交易
        const processedTxHashes = validTransactions.map(tx => tx.hash);
        this.mempool = this.mempool.filter(tx => 
            !processedTxHashes.includes(tx.hash)
        );

        // 创建新区块
        const blockData = {
            height: ++this.height,
            txs: validTransactions.length,
            reward: rewardAmount,
            miner: minerAddress,
            timestamp: Date.now(),
            transactions: [...validTransactions, rewardTx], // 包含奖励交易
            id: uuidv4() // 使用UUID作为区块ID
        };
        
        // 计算区块哈希
        const blockHeader = JSON.stringify({
            height: blockData.height,
            timestamp: blockData.timestamp,
            miner: blockData.miner,
            txs: blockData.txs
        });
        blockData.hash = this.sha256(blockHeader);
        
        this.addBlock(blockData);

        console.log(`✅ 成功出块！获得奖励: ${rewardAmount} token`);
        return blockData;
    }
}

module.exports = Blockchain;