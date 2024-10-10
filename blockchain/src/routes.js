const Router = require('koa-router');
const {
    createLog,
    createProduct,
    buyProduct,
    sellProduct,
    burnProductTokens,
    getBalance,
    getTransactionId,
    createWallet
} = require("./controllers");

module.exports = new Router({prefix: '/api'})
    .post('/logs', createLog)
    .post('/wallets', createWallet)
    .post('/products', createProduct)
    .post('/products/:productId/buy', buyProduct)
    .post('/products/:productId/sell', sellProduct)
    .post('/products/:productId/burn', burnProductTokens)
    .get('/products/:productId/balance/:userId', getBalance)
    .get('/transaction/:transactionId', getTransactionId)
    .get('/healthcheck', async ctx => ctx.status = 200);
