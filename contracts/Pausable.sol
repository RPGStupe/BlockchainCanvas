pragma solidity ^0.4.17;

contract Pausable {
    address public ownerAddress;

    bool public paused = false;

    modifier onlyOwner() {
        require(msg.sender == ownerAddress);
        _;
    }

    function setOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0));

        ownerAddress = _newOwner;
    }

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier whenPaused {
        require(paused);
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
    }

    function unpause() public onlyOwner whenPaused {
        paused = false;
    }
}