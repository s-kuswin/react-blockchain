const CryptoJS = require('crypto-js');
const EC = require('elliptic');
const { generateMnemonic, validateMnemonic, mnemonicToSeed } = require('bip39');

const ec = new EC.ec('secp256k1');

// 钱包类
class Wallet {
    constructor(mnemonic, address, privateKey = null, publicKey = null) {
        this.mnemonic = mnemonic;
        this.address = address;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        
        // 如果提供了私钥，则创建密钥对
        if (privateKey) {
            this.keyPair = ec.keyFromPrivate(privateKey, 'hex');
        }
    }

    // 使用私钥对数据进行签名
    async signData(data) {
        try {
            if (!this.keyPair) {
                throw new Error('私钥不存在');
            }
            
            // 使用椭圆曲线签名数据
            const signature = this.keyPair.sign(data).toDER('hex');
            return signature;
        } catch (error) {
            console.error('签名错误:', error);
            throw new Error('交易签名失败');
        }
    }
    
    // SHA-256 哈希函数实现
    sha256(message) {
        return CryptoJS.SHA256(message).toString();
    }
}

// SHA-256 哈希函数
function sha256(message) {
    return CryptoJS.SHA256(message).toString();
}

// 从公钥生成地址的函数
async function generateAddressFromPublicKey(publicKey) {
    // 对公钥进行哈希处理，然后进行编码
    // 模拟真实区块链中的地址生成过程
    const hashedKey = sha256(publicKey);
    // 使用部分哈希值生成地址
    const addressBytes = hashedKey.substring(0, 40); // 取前40个字符作为地址主体
    return 'cosmos1' + addressBytes;
}

// 从种子生成密钥对的函数
function generateKeyPairFromSeed(seedBuffer) {
    // 将种子转换为十六进制字符串
    const seedHex = seedBuffer.toString('hex');
    
    // 使用种子哈希作为私钥（简化实现）
    const privateKey = sha256(seedHex);
    
    // 从私钥生成密钥对
    const keyPair = ec.keyFromPrivate(privateKey);
    
    return {
        privateKey: keyPair.getPrivate('hex'),
        publicKey: keyPair.getPublic('hex')
    };
}

// 创建新钱包的函数
async function createWallet() {
    // 生成符合BIP39标准的助记词
    const mnemonic = generateMnemonic();
    
    // 从助记词派生种子（返回的是Buffer对象）
    const seed = await mnemonicToSeed(mnemonic);
    
    // 从种子生成密钥对
    const { privateKey, publicKey } = generateKeyPairFromSeed(seed);
    
    // 从公钥生成地址
    const address = await generateAddressFromPublicKey(publicKey);
    
    return new Wallet(mnemonic, address, privateKey, publicKey);
}

// 通过助记词导入钱包的函数
async function importWallet(mnemonic) {
    // 验证助记词
    if (!validateMnemonic(mnemonic)) {
        throw new Error('无效的助记词');
    }
    
    // 从助记词派生种子
    const seed = await mnemonicToSeed(mnemonic);
    
    // 从种子生成密钥对
    const { privateKey, publicKey } = generateKeyPairFromSeed(seed);
    
    // 从公钥生成地址
    const address = await generateAddressFromPublicKey(publicKey);
    
    return new Wallet(mnemonic, address, privateKey, publicKey);
}

module.exports = {
    Wallet,
    createWallet,
    importWallet,
    generateAddressFromPublicKey,
    sha256
};