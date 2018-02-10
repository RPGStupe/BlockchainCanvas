pragma solidity ^0.4.17;

import "./Pausable.sol";

contract CanvasAccessControl is Pausable {

    event ContractUpgrade(address newContract);

    function withdrawBalance() external onlyOwner {
        ownerAddress.transfer(this.balance);
    }
}