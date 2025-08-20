// 引入crypto-js库
import CryptoJS from 'crypto-js';
// 引入椭圆曲线加密库
import EC from 'elliptic';

// 创建椭圆曲线实例，确保使用正确的曲线参数
const createECInstance = () => {
    try {
        // 使用secp256k1曲线，这是比特币使用的椭圆曲线
        const ec = new EC.ec('secp256k1');
        console.log('✅ elliptic库初始化成功');
        return ec;
    } catch (error) {
        console.error('❌ 创建椭圆曲线实例失败:', error);
        throw new Error('椭圆曲线初始化失败，加密功能不可用');
    }
};

const ec = createECInstance();

// 钱包类
class Wallet {
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

export default Wallet;
