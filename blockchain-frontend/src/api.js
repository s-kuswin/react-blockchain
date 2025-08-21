import axios from 'axios';

const API_BASE_URL =  'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 区块链相关API
export const getBlockchainHeight = () => api.get('/height');
export const getBalance = (address) => api.get(`/balance/${address}`);
export const submitTransaction = (transaction) => api.post('/transaction', transaction);
export const mineBlock = (minerAddress) => api.post('/mine', { minerAddress });
export const getBlocks = () => api.get('/blocks');
export const getTransactions = () => api.get('/transactions');
export const getMempool = () => api.get('/mempool');

export default api;