import CustomError from "./CustomError";
class BadRequestError extends CustomError {
  constructor(message: string, name: string) {
    super({ message, name, status: 400 });
  }
}
export default BadRequestError;