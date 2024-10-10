import CustomError from "./CustomError";

class BlockChainError extends CustomError {
  constructor(message: string) {
    super({
      message: 'BlockChain Error: ' + message, 
      name: 'BlockChain',
      status: 400
    });
  }
}
export default BlockChainError;