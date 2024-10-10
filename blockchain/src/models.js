const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    userId: String,
    privateKey: String,
    address: String,
});

const productSchema = new Schema({
    userId: String,
    productId: String,
    contractAddress: String,
});

const auditLogSchema = new Schema({
    contractAddress: String,
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);


module.exports = {
    User,
    Product,
    AuditLog,
};
