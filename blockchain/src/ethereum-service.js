const Web3 = require('web3');
const {BLOCKCHAIN_URL, BLOCKCHAIN_ADDRESS, BLOCKCHAIN_PRIVATE_KEY} = require('./config');
const tokenContract = require("../build/contracts/TokyoCapitalToken.json");
const auditContract = require("../build/contracts/AuditLog.json");

const {User: UserModel, Product: ProductModel, AuditLog: AuditLogModel} = require("./models");
const {BusinessError} = require("./errors");

async function getBalance({productId, userId}) {
    const user = await getOrCreateUser(userId);
    const product = await getProduct(productId);

    const web3 = getWeb3();
    const ERC20 = new web3.eth.Contract(tokenContract.abi, product.contractAddress);
    const balance = await ERC20.methods.balanceOf(user.address).call({from: user.address});

    return {balance};
}

async function getTransactionId(param) {

}


async function sellProduct({buyerId, sellerId, productId, amount}) {
    const buyer = await getOrCreateUser(buyerId);
    const seller = await getOrCreateUser(sellerId);
    const product = await getProduct(productId);

    const {balance: currentBalance} = await getBalance({productId, userId: sellerId});
    if (currentBalance < amount) throw new BusinessError("Insufficient funds");

    const web3 = getWeb3();
    const ERC20 = new web3.eth.Contract(tokenContract.abi, product.contractAddress);
    const transaction = ERC20.methods.transfer(buyer.address, amount).encodeABI();
    const rawTransaction = {data: transaction, from: seller.address, to: product.contractAddress};

    return signAndSend(web3, rawTransaction, seller);
}

async function getOrDeployAuditLog(user) {

    const entity = await AuditLogModel.findOne({});
    if (entity) return entity;

    const web3 = getWeb3();
    const AuditContract = new web3.eth.Contract(auditContract.abi);
    const transaction = AuditContract.deploy({data: auditContract.bytecode}).encodeABI();
    const rawTransaction = {data: transaction, from: user.address};

    const transactionHash = await signAndSend(web3, rawTransaction, user);
    const {contractAddress} = transactionHash;

    await AuditLogModel.create({contractAddress});

    return {
        contractAddress,
    }
}

async function createLog({message}) {
    const admin = await getOrCreateUser("BLOCKCHAIN_ADMIN");

    const contract = await getOrDeployAuditLog(admin);

    const web3 = getWeb3();
    const contractInstance = new web3.eth.Contract(auditContract.abi, contract.contractAddress);
    const transaction = contractInstance.methods.add(message).encodeABI();
    const rawTransaction = {data: transaction, from: admin.address, to: contract.contractAddress};

    return signAndSend(web3, rawTransaction, admin);
}


async function buyProduct({buyerId, productId, amount,}) {
    const buyer = await getOrCreateUser(buyerId);
    const product = await getProduct(productId);
    const seller = await getOrCreateUser(product.userId);

    const web3 = getWeb3();
    const ERC20 = new web3.eth.Contract(tokenContract.abi, product.contractAddress);
    const transaction = ERC20.methods.transfer(buyer.address, amount).encodeABI();
    const rawTransaction = {data: transaction, from: seller.address, to: product.contractAddress};

    return signAndSend(web3, rawTransaction, seller);
}

async function burnTokens({userId, productId, amount,}) {
    const owner = await getOrCreateUser(userId);
    const product = await getProduct(productId);

    const {balance: currentBalance} = await getBalance({productId, userId});
    if (currentBalance < amount) throw new BusinessError("Insufficient funds");

    const web3 = getWeb3();
    const ERC20 = new web3.eth.Contract(tokenContract.abi, product.contractAddress);
    const transaction = ERC20.methods.burn(amount).encodeABI();
    const rawTransaction = {data: transaction, from: owner.address, to: product.contractAddress};

    return signAndSend(web3, rawTransaction, owner);
}

async function getOrCreateUser(userId) {
    const user = await UserModel.findOne({userId});
    if (user) return user.toObject();

    const {address, privateKey} = (new Web3()).eth.accounts.create();
    const newUser = await UserModel.create({userId, address, privateKey});
    return newUser.toObject();
}

async function getProduct(productId) {
    const product = await ProductModel.findOne({productId});
    if (product) return product.toObject();

    throw new Error("Product not found");
}

function getWeb3() {
    const web3 = new Web3();
    const httpProvider = new Web3.providers.HttpProvider(BLOCKCHAIN_URL);
    web3.setProvider(httpProvider);
    return web3;
}

async function signAndSend(web3, rawTransaction, user) {
    console.log(`Raw Transaction is ready for Estimate Gas`);
    //check for bug
    const estimatedGas = await web3.eth.estimateGas(rawTransaction) + 91000;
    //const estimatedGas = 91000;
    console.log(`Estimated gas -> ${estimatedGas}`);
    rawTransaction.gas = estimatedGas;
    rawTransaction.nonce = await web3.eth.getTransactionCount(user.address, 'pending');
    const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, user.privateKey);
    console.log(`Transaction signed`);
    const transactionHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction sent`);
    return transactionHash;
}

async function createProduct({userId, productId, name = "MyToken", symbol = "MT", initialAmount = 0,}) {
    const user = await getOrCreateUser(userId);

    const web3 = getWeb3();
    const ERC20 = new web3.eth.Contract(tokenContract.abi);
    const transaction = ERC20.deploy({
        data: tokenContract.bytecode, arguments:
            [name, symbol, initialAmount]
    }).encodeABI();
    const rawTransaction = {data: transaction, from: user.address};

    const transactionHash = await signAndSend(web3, rawTransaction, user);
    const {contractAddress} = transactionHash;
    await ProductModel.create({userId, productId, contractAddress});

    return transactionHash;
}


function createWallet({userId}) {
    return getOrCreateUser(userId);
}


module.exports = {
    createProduct,
    buyProduct,
    sellProduct,
    burnTokens,
    getBalance,
    getTransactionId,
    createLog,
    createWallet,
};
