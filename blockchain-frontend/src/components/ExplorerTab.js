import React, { useState } from 'react';

const ExplorerTab = ({ blockchain }) => {
  const [activeTab, setActiveTab] = useState('blocks');

  return (
    <div id="explorer-tab">
      <div className="tabs" role="tablist">
        <div 
          className={`tab ${activeTab === 'blocks' ? 'active' : ''}`} 
          onClick={() => setActiveTab('blocks')}
          role="button"
          tabIndex={0}
          aria-pressed={activeTab === 'blocks'}
        >
          <span className="tab-content">
            <span className="tab-title">区块</span>
          </span>
        </div>
        <div 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} 
          onClick={() => setActiveTab('transactions')}
          role="button"
          tabIndex={0}
          aria-pressed={activeTab === 'transactions'}
        >
          <span className="tab-content">
            <span className="tab-title">交易</span>
          </span>
        </div>
      </div>

      <div className="explorer-content">
        {activeTab === 'blocks' && (
          <div className="card">
            <h2>区块列表</h2>
            <div className="blocks-list">
              {blockchain.blocks && blockchain.blocks.length > 0 ? (
                blockchain.blocks.map((block) => (
                  <div key={block.id || block.hash} className="block-item">
                    <div className="block-header">
                      <p className="block-hash">区块哈希: {block.hash}</p>
                      <p className="block-height">区块高度: #{block.height}</p>
                    </div>
                    <div className="block-details">
                      <p>交易数: {block.txs || 0}</p>
                      <p>矿工: {block.miner ? block.miner : 'N/A'}</p>
                      <p>奖励: {block.reward || 0} token</p>
                      <p>时间戳: {block.timestamp ? new Date(block.timestamp).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>暂无区块数据</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card">
            <h2>交易列表</h2>
            <div className="transactions-list">
              {blockchain.transactions && blockchain.transactions.length > 0 ? (
                blockchain.transactions.map((tx) => (
                  <div key={tx.hash} className="transaction-item">
                    <div className="transaction-header">
                      <span className="transaction-hash">交易哈希: {tx.hash}</span>
                    </div>
                    <div className="transaction-details">
                      <p>发送方: {tx.from ? tx.from : 'N/A'}</p>
                      <p>接收方: {tx.to ? tx.to : 'N/A'}</p>
                      <p>金额: {tx.amount || 0} {tx.denom || 'token'}</p>
                      <p>时间戳: {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>暂无交易数据</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerTab;