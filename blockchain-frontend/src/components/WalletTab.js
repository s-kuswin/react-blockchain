import React, { useState, useEffect } from 'react';
import { getBalance } from '../api';

const WalletTab = ({ currentWallet, onCreateWallet, onImportWallet }) => {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.address);
    }
  }, [currentWallet]);

  const fetchBalance = async (address) => {
    try {
      const {data: balanceData} = await getBalance(address);
      
      setBalance(balanceData);
      
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  const handleCreateWallet = () => {
    onCreateWallet();
  };

  const handleImportWallet = () => {
    onImportWallet(importMnemonic);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div id="wallet-tab">
      {!currentWallet ? (
        <div className="card">
          <h2>创建或导入钱包</h2>
          <div className="form-group">
            <button onClick={handleCreateWallet} className="primary">
              创建新钱包
            </button>
          </div>
          <div className="form-group">
            <textarea 
              placeholder="输入12个单词的助记词"
              value={importMnemonic}
              onChange={(e) => setImportMnemonic(e.target.value)}
            />
            <button onClick={handleImportWallet} className="secondary">
              导入钱包
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>钱包信息</h2>
          <div className="wallet-info">
            <div className="form-group">
              <label>钱包地址</label>
              <div className="input-group">
                <input 
                  type="text" 
                  value={currentWallet.address} 
                  readOnly 
                />
                <button onClick={() => copyToClipboard(currentWallet.address)} className="small">
                  复制
                </button>
              </div>
            </div>
            
            {balance && (
              <div className="form-group">
                <label>余额</label>
                <input 
                  type="text" 
                  value={`${balance.amount} ${balance.denom}`} 
                  readOnly 
                />
              </div>
            )}
            
            <div className="form-group">
              <button onClick={() => setShowMnemonic(!showMnemonic)} className="outline">
                {showMnemonic ? '隐藏助记词' : '显示助记词'}
              </button>
            </div>
            
            {showMnemonic && (
              <div className="form-group">
                <label>助记词 (请妥善保管)</label>
                <div className="input-group">
                  <textarea 
                    value={currentWallet.mnemonic} 
                    readOnly 
                    rows="3"
                  />
                  <button onClick={() => copyToClipboard(currentWallet.mnemonic)} className="small">
                    复制
                  </button>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <button 
                onClick={() => {
                  localStorage.removeItem('current_wallet');
                  window.location.reload();
                }}
                className="secondary"
              >
                删除钱包
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTab;