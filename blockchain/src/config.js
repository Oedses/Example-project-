require('dotenv').config();

const {
    APP_PORT = 3003,
    NODE_ENV = 'development',
    CRYPTO_SECRET = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
    MONGO_URL,
    BLOCKCHAIN_URL,
    BLOCKCHAIN_ADDRESS,
    BLOCKCHAIN_PRIVATE_KEY,
} = process.env;

module.exports = {
    PORT: Number(APP_PORT),
    NODE_ENV,
    MONGO_URL,
    BLOCKCHAIN_URL,
    BLOCKCHAIN_PRIVATE_KEY,
    BLOCKCHAIN_ADDRESS,
    CRYPTO_SECRET,
};
