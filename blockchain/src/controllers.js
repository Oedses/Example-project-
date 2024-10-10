
const crypto = require("./crypto-service");
const service = require("./ethereum-service");
const {
    validateCreateWalletRequest,
    validateSellProductRequest,
    validateBuyProductRequest,
    validateCreateProductRequest,
    validateBurnProductTokenRequest,
    validateCreateLogRequest
} = require("./validators");

async function createProduct(ctx) {
    const {userId, productId, name, symbol, initialAmount} = validateCreateProductRequest(ctx);
    ctx.body = await service.createProduct({userId, productId, name, symbol, initialAmount});
}

async function buyProduct(ctx) {
    const {amount, buyerId, productId,} = validateBuyProductRequest(ctx);

    ctx.body = await service.buyProduct({
        buyerId, productId, amount,
    });
}

async function sellProduct(ctx) {
    const {buyerId, sellerId, amount, productId,} = validateSellProductRequest(ctx);
    ctx.body = await service.sellProduct({
        buyerId, sellerId, productId, amount
    });
}

async function burnProductTokens(ctx) {
    const {userId, amount, productId,} = validateBurnProductTokenRequest(ctx);

    ctx.body = await service.burnTokens({
        userId, productId, amount
    });
}

async function getBalance(ctx) {
    const {
        request: {
            params: {
                userId, productId,
            },
        },
    } = ctx;
    ctx.body = await service.getBalance({productId, userId});
}

async function getTransactionId(ctx) {
    const {
        request: {
            params: {
                transactionId,
            }
        }
    } = ctx;
    ctx.body = await service.getTransactionId({transactionId});
}

async function createLog(ctx) {
    const {message} = validateCreateLogRequest(ctx);

    ctx.body = await service.createLog({
        message: crypto.encrypt(message),
    });
}

async function createWallet(ctx) {
    const {userId} = validateCreateWalletRequest(ctx);
    ctx.body = await service.createWallet({userId});
}

module.exports = {
    createProduct,
    buyProduct,
    sellProduct,
    burnProductTokens,
    getBalance,
    getTransactionId,
    createLog,
    createWallet,
};
