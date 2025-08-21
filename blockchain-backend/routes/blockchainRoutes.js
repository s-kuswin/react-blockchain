/*
 * @Author: shirongwei-lhq
 * @Date: 2025-08-20 09:41:59
 * @LastEditors: shirongwei-lhq
 * @LastEditTime: 2025-08-20 10:01:23
 * @Description: 
 */
const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// 获取区块链高度
router.get('/height', blockchainController.getHeight);

// 获取账户余额
router.get('/balance/:address', blockchainController.getBalance);

// 提交交易到内存池
router.post('/transaction', blockchainController.submitTransaction);

// 挖矿出块
router.post('/mine', blockchainController.mineBlock);

// 获取所有区块
router.get('/blocks', blockchainController.getBlocks);

// 获取所有交易
router.get('/transactions', blockchainController.getTransactions);

// 获取内存池中的交易
router.get('/mempool', blockchainController.getMempool);

module.exports = router;