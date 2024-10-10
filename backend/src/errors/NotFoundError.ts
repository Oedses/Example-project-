import CustomError from "./CustomError";

class NotFoundError extends CustomError {
  constructor(message: string, name: string) {
    super({ message, name, status: 404 });
  }
}
export default NotFoundError;