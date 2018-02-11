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
    
    function fillCanvas(uint256 _canvasId, uint256 _red1, uint256 _green1, uint256 _blue1, uint256 _red2, uint256 _green2, uint256 _blue2) public whenNotPaused {
        require(_owns(msg.sender, _canvasId));

        canvas[_canvasId].red1 = _red1;
        canvas[_canvasId].green1 = _green1;
        canvas[_canvasId].blue1 = _blue1;
        canvas[_canvasId].red2 = _red2;
        canvas[_canvasId].green2 = _green2;
        canvas[_canvasId].blue2 = _blue2;

        CanvasFilled(_red1, _green1, _blue1, _red2, _green2, _blue2, _canvasId);
    }

    function returnNumber(uint256 _testNum) external pure returns(uint256 num) {
        num = _testNum;
    }

    function getCanvas(uint256 _canvasId) external view returns(uint256 _x, uint256 _y, uint256 _red1, uint256 _green1, uint256 _blue1, uint256 _red2, uint256 _green2, uint256 _blue2) {
        _red1 = canvas[_canvasId].red1;
        _green1 = canvas[_canvasId].green1;
        _blue1 = canvas[_canvasId].blue1;
        _red2 = canvas[_canvasId].red2;
        _green2 = canvas[_canvasId].green2;
        _blue2 = canvas[_canvasId].blue2;
        _x = canvas[_canvasId].x;
        _y = canvas[_canvasId].y;
    }

    function unpause() public onlyOwner whenPaused {
        require(marketPlace != address(0));
        require(newContractAddress == address(0));
        
        super.unpause();
    }
}