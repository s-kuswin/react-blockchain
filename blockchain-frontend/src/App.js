import React, { useState, useEffect, useCallback } from 'react';
import {
  getBlockchainHeight,
  getBlocks,
  getTransactions,
  getMempool,
  getBalance,
  submitTransaction,
  mineBlock
} from './api';
import WalletTab from './components/WalletTab';
import { Wallet, createWallet, importWallet} from './utils/wallet';
import Transfer from './components/TransferTab';
import Miner from './components/MinerTab';
import Explorer from './components/ExplorerTab';
import './App.css';

function App() {
  // 应用状态
  const [activeTab, setActiveTab] = useState('wallet');
  const [currentWallet, setCurrentWallet] = useState(null);
  const [notification, setNotification] = useState(null);
  const [minerNode, setMinerNode] = useState({
    blocksMined: 0,
    rewards: 0,
    mempool: []
  });
  const [blockchain, setBlockchain] = useState({
    height: 0,
    blocks: [],
    transactions: []
  });
  
  
  // 通知状态
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

    // 获取区块链数据
  const fetchBlockchainData = useCallback(async () => {
    try {
      
      // 获取区块链高度
      const { data:heightData } = await getBlockchainHeight();
      setBlockchain(prev => ({ ...prev, height: heightData.height }));
      
      // 获取区块数据
      const { data: blocksData } = await getBlocks();
      
      setBlockchain(prev => ({ ...prev, blocks: blocksData }));
      
      // 获取交易数据
      const { data:transactionsData } = await getTransactions();
      setBlockchain(prev => ({ ...prev, transactions: transactionsData }));
      
      // 获取内存池数据
      const { data:mempoolData } = await getMempool();
      setMinerNode(prev => ({ ...prev, mempool: mempoolData }));
      
    } catch (error) {
      console.error('获取区块链数据失败:', error);
      showNotification('获取区块链数据失败', 'error');
    }
  }, []);

  // 页面加载时尝试恢复钱包并获取区块链状态
  useEffect(() => {
    const savedWallet = localStorage.getItem('current_wallet');
    if (savedWallet) {
      const walletData = JSON.parse(savedWallet);
      // 使用Wallet类创建钱包实例
      const wallet = new Wallet(
        walletData.mnemonic,
        walletData.address,
        walletData.privateKey,
        walletData.publicKey
      );
      setCurrentWallet(wallet);
    }
    
    // 获取区块链状态
    fetchBlockchainData();
  }, [fetchBlockchainData]);

    // 当切换到miner或explorer标签时，获取最新数据
  useEffect(() => {
    if (activeTab === 'miner' || activeTab === 'explorer') {
      fetchBlockchainData();
    }
  }, [activeTab, fetchBlockchainData]);

  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // 创建新钱包
  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet();
      console.log('Created wallet:', wallet);
      setCurrentWallet(wallet);
      wallet.saveToLocalStorage(); // 使用Wallet类的方法保存到本地存储
      showNotification('钱包创建成功', 'success');
      
      // 更新余额
      if (wallet.address) {
         updateWallet(wallet)
      }
    } catch (error) {
      console.error('创建钱包失败:', error);
      showNotification('创建钱包失败', 'error');
    }
  };

  // 导入钱包
  const handleImportWallet = async (mnemonic) => {
    try {
      const wallet = await importWallet(mnemonic);
      
      // 使用Wallet类的方法保存到本地存储
      wallet.saveToLocalStorage();
      setCurrentWallet(wallet);
      
      showNotification('钱包导入成功', 'success');
      
      // 获取余额并更新状态
      updateWallet(wallet)

    } catch (error) {
      console.error('导入钱包失败:', error);
      showNotification('导入钱包失败: ' + error.message, 'error');
    }
  };

  const updateWallet = async (wallet) => {
      const { data: balanceResponse } = await getBalance(wallet.address);
      wallet.updataAmount(balanceResponse.amount);
  };


    // 发送转账
  const handleTransfer = async ({ sender, recipient, amount }) => {
    try {
      if (!sender || !recipient || !amount) {
        showNotification('请填写所有字段', 'error');
        return;
      }
      
      if (isNaN(amount) || parseInt(amount) <= 0) {
        showNotification('请输入有效的金额', 'error');
        return;
      }
      
      if (!currentWallet) {
        showNotification('请先创建或导入钱包', 'error');
        return;
      }

      console.log('currentWallet', currentWallet)
      
      // 创建交易对象
      const tx = {
        from: sender,
        to: recipient,
        amount: amount,
        denom: 'token',
        timestamp: Date.now()
      };
      
      // 使用Wallet类的方法签名交易
      const signedTx = await currentWallet.signTransaction(tx);
      
      // 将交易提交到内存池
      const {  data:resData } = await submitTransaction(signedTx);
      const { message, code } = resData;
      // 更新UI
      showNotification(message, code === 200 ? 'success' : 'error');
      
      // 刷新区块链数据
      fetchBlockchainData();
    } catch (error) {
      showNotification('转账失败: ' + error.message, 'error');
    }
  };

  // 处理挖矿
  const handleMineBlock = async () => {
    try {
      const response = await mineBlock(currentWallet.address);
      if (response.data.block) {
        showNotification(`成功挖出区块 #${response.data.block.height}`, 'success');
        // 更新矿工统计数据
        setMinerNode(prev => ({
          ...prev,
          blocksMined: prev.blocksMined + 1,
          rewards: prev.rewards + response.data.block.reward
        }));
        // 刷新区块链数据
        fetchBlockchainData();
      } else {
        showNotification(response.data.message, 'info');
      }
    } catch (error) {
      console.error('挖矿失败:', error);
      showNotification('挖矿失败: ' + error.message, 'error');
    }
  };

  return (
    <div className="App">
      {/* <header className="app-header"> */}
        {/* <h1>区块链模拟器</h1> */}

      {/* </header> */}
      <nav className='tabs'>
          <button 
            className={activeTab === 'wallet' ? 'active' : ''}
            onClick={() => setActiveTab('wallet')}
          >
            钱包
          </button>
          <button 
            className={activeTab === 'transfer' ? 'active' : ''}
            onClick={() => setActiveTab('transfer')}
            disabled={!currentWallet}
          >
            转账
          </button>
          <button 
            className={activeTab === 'miner' ? 'active' : ''}
            onClick={() => setActiveTab('miner')}
          >
            挖矿
          </button>
          <button 
            className={activeTab === 'explorer' ? 'active' : ''}
            onClick={() => setActiveTab('explorer')}
          >
            浏览器
          </button>
        </nav>

      <main>
        {activeTab === 'wallet' && (
          <WalletTab 
            currentWallet={currentWallet}
            onCreateWallet={handleCreateWallet}
            onImportWallet={handleImportWallet}
          />
        )}

        {activeTab === 'transfer' && (
          <Transfer 
            currentWallet={currentWallet}
            onTransfer={handleTransfer}
          />
        )}

        {activeTab === 'miner' && (
          <Miner 
            minerNode={minerNode}
            onMineBlock={handleMineBlock}
          />
        )}

        {activeTab === 'explorer' && (
          <Explorer 
            blockchain={blockchain}
          />
        )}
      </main>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;