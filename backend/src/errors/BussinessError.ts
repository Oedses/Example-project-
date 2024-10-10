import CustomError from "./CustomError";

class BussinessError extends CustomError {
  constructor(message: string, name: string) {
    super({ message, name, status: 409 });
  }
}
export default BussinessError;