# 区块链模拟器

这是一个基于React和Node.js的区块链模拟器项目，实现了区块链的基本功能，包括钱包创建、转账、挖矿和区块链浏览等功能。项目采用前后端分离架构。

## 项目结构

```
├── backend/                # 后端代码
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── src/                # 源代码
│   └── package.json        # 后端依赖
├── src/                    # 前端代码
│   ├── components/         # React组件
│   ├── App.js              # 主应用组件
│   ├── api.js              # API调用
│   └── blockchain.js       # 区块链前端逻辑
└── package.json            # 前端依赖
```

## 技术栈

### 前端
- React
- Axios
- Elliptic (椭圆曲线加密)

### 后端
- Node.js
- Express
- Crypto-js
- BIP39 (助记词生成)
- Elliptic (椭圆曲线加密)

## 功能特性

1. **钱包管理**
   - 创建新钱包
   - 导入已有钱包
   - 查看钱包余额

2. **转账功能**
   - 发送代币到其他地址
   - 交易签名验证

3. **挖矿功能**
   - 打包交易
   - 生成新区块
   - 获取挖矿奖励

4. **区块链浏览**
   - 查看区块列表
   - 查看交易列表

## 安装与运行

### 安装依赖

1. 安装前端依赖
```bash
npm install
```

2. 安装后端依赖
```bash
cd backend
npm install
```

### 运行项目

1. 同时启动前端和后端（开发模式）
```bash
npm run dev
```

2. 仅启动前端
```bash
npm start
```

3. 仅启动后端
```bash
npm run server
```

## API接口

后端提供以下API接口：

- `GET /height` - 获取区块链高度
- `GET /balance/:address` - 获取账户余额
- `POST /wallet/create` - 创建新钱包
- `POST /wallet/import` - 导入已有钱包
- `POST /transaction` - 提交交易
- `POST /mine` - 挖矿出块
- `GET /blocks` - 获取所有区块
- `GET /block/latest` - 获取最新区块
- `GET /transactions` - 获取所有交易
- `GET /mempool` - 获取内存池中的交易