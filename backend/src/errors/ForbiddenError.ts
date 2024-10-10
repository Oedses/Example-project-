import CustomError from "./CustomError";
class ForbiddenError extends CustomError {
  constructor(message: string, name: string) {
    super({ message, name, status: 403 });
  }
}
export default ForbiddenError;
