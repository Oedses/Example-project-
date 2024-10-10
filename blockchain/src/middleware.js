const {ValidationError, BusinessError} = require("./errors");

async function errorHandler(ctx, next) {
    try {
        await next();
    } catch (e) {
        if (e.type === ValidationError.type || e.type === BusinessError.type) {
            ctx.body = {
                message: e.message
            };
            ctx.status = 400;
            return;
        }

        ctx.body = {
            message: e.message
        };
        ctx.status = 500;

    }
}

module.exports = {
    errorHandler
}
