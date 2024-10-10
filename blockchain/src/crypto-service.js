const CryptoJS = require("crypto-js");
const {CRYPTO_SECRET: secretKey} = require('./config');


const encrypt = (text) => {
    const encrypted = CryptoJS.AES.encrypt(text, secretKey);
    return encrypted.toString();

};

const decrypt = (content) => {
    const decrypted = CryptoJS.AES.decrypt(content, secretKey);
    return CryptoJS.enc.Utf8.stringify(decrypted);
};

module.exports = {
    encrypt,
    decrypt
};

