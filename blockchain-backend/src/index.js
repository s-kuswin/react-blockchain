const express = require('express');
const cors = require('cors');
require('dotenv').config();

const blockchainRoutes = require('../routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API路由
app.use('/', blockchainRoutes);

app.listen(PORT, () => {
    console.log(`区块链后端服务运行在端口 ${PORT}`);
});