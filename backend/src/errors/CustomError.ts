import config from '../config';

interface CustomErrorInterface {
    name: string;
    message: string;
    status: number;
    stack?: string;
}

class CustomError extends Error {
    status: number;

    constructor({message, name, status}: CustomErrorInterface) {
        super(message);
        this.name = name;
        this.status = status;
        
        if (config.NODE_ENV !== 'dev') {
            this.stack = name;
        }
    }
}

export default CustomError;