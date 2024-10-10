class ValidationError extends Error {
    static type = "ValidationError"

    constructor(error) {
        super(error)
        this.status = 400;
    }
}

class BusinessError extends Error {
    static type = "BusinessError"

    constructor(message) {
        super(message);
        this.status = 409;
    }

}


module.exports = {
    ValidationError,
    BusinessError
}
