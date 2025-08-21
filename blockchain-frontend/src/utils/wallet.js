import CryptoJS from 'crypto-js';
// 引入椭圆曲线加密库
import EC from 'elliptic';
import { generateMnemonic, validateMnemonic, mnemonicToSeed } from 'bip39';

const ec = new EC.ec('secp256k1');

// 钱包类
export class Wallet {
    constructor(mnemonic, address, privateKey = null, publicKey = null) {
        this.mnemonic = mnemonic;
        this.address = address;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.amount = 0;
        
        // 如果提供了私钥，则创建密钥对
        if (privateKey) {
            this.keyPair = ec.keyFromPrivate(privateKey, 'hex');
        }
        
        // 如果提供了公钥但没有私钥，创建公钥对象
        if (publicKey && !privateKey) {
            this.keyPair = ec.keyFromPublic(publicKey, 'hex');
        }
    }
    
    // 保存钱包到本地存储
    saveToLocalStorage() {
        try {
            const walletData = {
                mnemonic: this.mnemonic,
                address: this.address,
                privateKey: this.privateKey,
                publicKey: this.publicKey
            };
            localStorage.setItem('current_wallet', JSON.stringify(walletData));
        } catch (error) {
            console.error('保存钱包到本地存储时出错:', error);
        }
    }

    updataAmount(amount) {
        this.amount = amount;
    }
    
    // 从本地存储加载钱包
    static loadFromLocalStorage() {
        try {
            const savedWallet = localStorage.getItem('current_wallet');
            if (savedWallet) {
                const walletData = JSON.parse(savedWallet);
                return new Wallet(
                    walletData.mnemonic,
                    walletData.address,
                    walletData.privateKey,
                    walletData.publicKey
                );
            }
            return null;
        } catch (error) {
            console.error('从本地存储加载钱包时出错:', error);
            return null;
        }
    }

    // 签名交易
    async signTransaction(tx) {
        // 检查是否有私钥用于签名
        if (!this.privateKey || !this.keyPair) {
            throw new Error('无法签名交易：缺少私钥');
        }
        
        // 创建不包含签名的交易副本
        const txToSign = {
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            denom: tx.denom || 'token',
            timestamp: tx.timestamp
        };

        // 将交易数据转换为字符串
        const txData = JSON.stringify(txToSign);
        
        // 使用私钥对数据进行签名
        const signature = this.keyPair.sign(txData).toDER('hex');
        
        // 添加签名和公钥到交易对象
        return {
            ...tx,
            signature: signature,
            publicKey: this.publicKey // 添加公钥用于验证
        };
    }
    
    // SHA-256 哈希函数实现
    sha256(message) {
        return CryptoJS.SHA256(message).toString();
    }
}

// SHA-256 哈希函数
export function sha256(message) {
    return CryptoJS.SHA256(message).toString();
}

// 从公钥生成地址的函数
export async function generateAddressFromPublicKey(publicKey) {
    // 对公钥进行哈希处理，然后进行编码
    // 模拟真实区块链中的地址生成过程
    const hashedKey = sha256(publicKey);
    // 使用部分哈希值生成地址
    const addressBytes = hashedKey.substring(0, 40); // 取前40个字符作为地址主体
    return 'cosmos1' + addressBytes;
}

// 从种子生成密钥对的函数
export function generateKeyPairFromSeed(seedBuffer) {
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
export async function createWallet() {
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
export async function importWallet(mnemonic) {
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