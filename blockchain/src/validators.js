const Joi = require("joi");
const {ValidationError} = require("./errors");


function check({error, value}) {
    if (error) throw new ValidationError(error);

    return value;
}

function validateCreateWalletRequest(ctx) {
    return check(Joi.object({
        userId: Joi.string().required(),
    }).validate(ctx.request.body));
}

function validateCreateProductRequest(ctx) {
    return check(Joi.object({
        userId: Joi.string().required(),
        productId: Joi.string().required(),
        name: Joi.string().required(),
        symbol: Joi.string().required(),
        initialAmount: Joi.number().integer().min(0).required(),
    }).validate(ctx.request.body));
}

function validateBuyProductRequest(ctx) {
    const requestBody = check(Joi.object({
        buyerId: Joi.string().required(),
        amount: Joi.number().integer().required(),
    }).validate(ctx.request.body));

    const requestParam = check(Joi.object({
        productId: Joi.string().required(),
    }).validate(ctx.request.params));

    return {
        ...requestParam,
        ...requestBody,
    };
}

function validateSellProductRequest(ctx) {
    const requestBody = check(Joi.object({
        buyerId: Joi.string().required(),
        sellerId: Joi.string().required(),
        amount: Joi.number().integer().required(),
    }).validate(ctx.request.body));

    const requestParam = check(Joi.object({
        productId: Joi.string().required(),
    }).validate(ctx.request.params));

    return {
        ...requestParam,
        ...requestBody,
    };
}

function validateBurnProductTokenRequest(ctx) {
    const requestBody = check(Joi.object({
        userId: Joi.string().required(),
        amount: Joi.number().integer().required(),
    }).validate(ctx.request.body));

    const requestParam = check(Joi.object({
        productId: Joi.string().required(),
    }).validate(ctx.request.params));

    return {
        ...requestParam,
        ...requestBody,
    };
}

function validateCreateLogRequest(ctx) {
    return check(Joi.object({
        message: Joi.string().required(),
    }).validate(ctx.request.body));
}

module.exports = {
    validateCreateProductRequest,
    validateBuyProductRequest,
    validateSellProductRequest,
    validateCreateLogRequest,
    validateBurnProductTokenRequest,
    validateCreateWalletRequest
}
