pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokyoCapitalToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 originalAmount) ERC20(name, symbol) {
        _mint(msg.sender, originalAmount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
}
