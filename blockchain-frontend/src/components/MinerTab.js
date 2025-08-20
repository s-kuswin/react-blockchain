import React from 'react';

const MinerTab = ({ minerNode, onMineBlock }) => {
  // 使用默认值确保组件在数据未定义时也能安全渲染
  const blocksMined = minerNode?.blocksMined ?? 0;
  const rewards = minerNode?.rewards ?? 0;
  const mempoolLength = minerNode?.mempool?.length ?? 0;

  return (
    <div id="miner-tab">
      <div className="card">
        <h2>矿工操作</h2>
        <div className="form-group">
          <button onClick={onMineBlock} className="primary">
            挖矿出块
          </button>
        </div>
        <div className="miner-status">
          <div>
            <p><strong>已挖区块数:</strong> {blocksMined}</p>
            <p><strong>累计奖励:</strong> {rewards} token</p>
          </div>
          <div>
            <p><strong>内存池交易数:</strong> {mempoolLength}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerTab;