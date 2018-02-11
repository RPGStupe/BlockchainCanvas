pragma solidity ^0.4.17;

import "./CanvasAccessControl.sol";

contract CanvasModel is CanvasAccessControl {
    
    /*** EVENTS ***/

    event Transfer(address from, address to, uint256 tokenId);

    event CanvasFilled(uint256 red1, uint256 green1, uint256 blue1, 
        uint256 red2, uint256 green2, uint256 blue2, uint256 canvasId);

    event CanvasReleased(uint256 canvasId);

    /***DATA TYPES ***/

    // A canvas consists of 64 pixels (8x8).
    // The colors of the pixels are serialized into two 256 integers per color.
    // Every integer contains the specific color information for 32 pixels.
    // Using 8-bit arrays of length 64 is just too expensive in gas :-(
    struct Canvas {
        uint256 x;
        uint256 y;
        uint256 red1;
        uint256 green1;
        uint256 blue1;
        uint256 red2;
        uint256 green2;
        uint256 blue2;
    }
    
    /*** STORAGE ***/
    mapping (uint256 => address) public canvasIdToOwner;

    mapping (uint256 => address) public canvasIdToApproved;

    mapping (address => uint256) ownershipCanvasCount;
    
    Canvas[] canvas;

    function _transfer(address _from, address _to, uint256 _canvasId) internal {
        ownershipCanvasCount[_to]++;
        canvasIdToOwner[_canvasId] = _to;
        ownershipCanvasCount[_from]--;
        delete canvasIdToApproved[_canvasId];
        
        Transfer(_from, _to, _canvasId);
    }

    function _createCanvas(
        uint256 _x, 
        uint256 _y, 
        uint256 _red1, 
        uint256 _green1, 
        uint256 _blue1, 
        uint256 _red2, 
        uint256 _green2, 
        uint256 _blue2, 
        address _owner
    ) 
        internal 
        returns (uint256)
    {
        Canvas memory _canvas = Canvas({
        x: _x, 
        y: _y, 
        red1: _red1, 
        green1: _green1, 
        blue1: _blue1, 
        red2: _red2, 
        green2: _green2, 
        blue2: _blue2
        });

        uint256 newCanvasId = canvas.push(_canvas) - 1;
        
        _transfer(0, _owner, newCanvasId);
        
        return newCanvasId;
    }
}