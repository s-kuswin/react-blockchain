import React, { useState, useEffect } from 'react';

const TransferTab = ({ currentWallet, onTransfer }) => {
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    if (currentWallet) {
      setSenderAddress(currentWallet.address);
    }
  }, [currentWallet]);

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的转账金额');
      return;
    }

    const payload = {
      sender: senderAddress,
      recipient: recipientAddress,
      amount: amount,
      timestamp: new Date().toISOString()
    };

    onTransfer(payload);
    // 清空转账金额
    setTransferAmount('');
  };

  return (
    <div id="transfer-tab">
      <div className="card">
        <h2>发起转账</h2>
        <div className="form-group">
          <label htmlFor="senderAddress">发送方地址</label>
          <input 
            type="text" 
            id="senderAddress" 
            placeholder="发送方钱包地址"
            value={senderAddress}
            disabled
            onChange={(e) => setSenderAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="recipientAddress">接收方地址</label>
          <input 
            type="text" 
            id="recipientAddress" 
            placeholder="接收方钱包地址"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="transferAmount">转账金额</label>
          <input 
            type="number" 
            id="transferAmount" 
            placeholder="转账金额"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <button onClick={handleTransfer} className="primary">
            发送转账
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferTab;