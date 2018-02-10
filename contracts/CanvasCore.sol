pragma solidity ^0.4.17;

import "./CanvasMinting.sol";

contract CanvasCore is CanvasMinting {

    event ContractUpgrade(address newAddress);

    address public newContractAddress;

    function CanvasCore() public {
        paused = true;

        ownerAddress = msg.sender;
    }

    function setNewAddress(address _v2Address) public onlyOwner whenPaused {
        newContractAddress = _v2Address;
        ContractUpgrade(_v2Address);
    }

    function() external payable {
        require(msg.sender == address(marketPlace));
    }
    
    function fillCanvas(uint256 _canvasId, uint8[64] _red, uint8[64] _green, uint8[64] _blue, uint8[64] _alpha) public whenNotPaused {
        require(_owns(msg.sender, _canvasId));

        canvas[_canvasId].red = _red;
        canvas[_canvasId].green = _green;
        canvas[_canvasId].blue = _blue;
        canvas[_canvasId].alpha = _alpha;

        CanvasFilled(_red, _green, _blue, _alpha, _canvasId);
    }

    function getCanvas(uint256 _canvasId) external view returns(uint256 _x, uint256 _y, uint8[64] _red, uint8[64] _green, uint8[64] _blue, uint8[64] _alpha) {
        _red = canvas[_canvasId].red;
        _green = canvas[_canvasId].green;
        _blue = canvas[_canvasId].blue;
        _alpha = canvas[_canvasId].alpha;
        _x = canvas[_canvasId].x;
        _y = canvas[_canvasId].y;
    }

    function unpause() public onlyOwner whenPaused {
        require(marketPlace != address(0));
        require(newContractAddress == address(0));
        
        super.unpause();
    }
}