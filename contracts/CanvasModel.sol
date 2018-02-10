pragma solidity ^0.4.17;

import "./CanvasAccessControl.sol";

contract CanvasModel is CanvasAccessControl {
    
    /*** EVENTS ***/

    event Transfer(address from, address to, uint256 tokenId);
    event CanvasFilled(uint8[64] red, uint8[64] green, uint8[64] blue, uint8[64] alpha, uint256 canvasId);
    event CanvasReleased(uint256 canvasId);

    /***DATA TYPES ***/

    struct Canvas {
        uint256 x;
        uint256 y;
        uint8[64] red;
        uint8[64] green;
        uint8[64] blue;
        uint8[64] alpha;
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

    function _createCanvas(uint256 _x, uint256 _y, uint8[64] _red, uint8[64] _green, uint8[64] _blue, uint8[64] _alpha, address _owner) internal returns (uint256) {
      Canvas memory _canvas = Canvas({
        x: _x, 
        y: _y, 
        red: _red, 
        green: _green, 
        blue: _blue, 
        alpha: _alpha
      });

      uint256 newCanvasId = canvas.push(_canvas) - 1;
      
      _transfer(0, _owner, newCanvasId);
      
      return newCanvasId;
    }
}