pragma solidity ^0.4.17;

contract CanvasModel {
    
    event Transfer(address from, address to, uint256 tokenId);
    event CanvasFilled(uint8[64] red, uint8[64] green, uint8[64] blue, uint8[64] alpha, uint256 canvasId);

    struct Canvas {
        uint256 x;
        uint256 y;
        uint8[64] red;
        uint8[64] green;
        uint8[64] blue;
        uint8[64] alpha;
    }
    
    mapping (uint256 => address) canvasIdToOwner;
    mapping (uint256 => address) canvasIdToApproved;
    mapping (address => uint256) ownershipCanvasCount;
    
    Canvas[] canvas;
    uint256 nextX;
    uint256 nextY;

    uint256 public constant MAX_COLUMNS = 1024;
    uint256 public constant MAX_STANDARD_RELEASE_CANVAS = 1000000;
    uint256 public constant MAX_PROMO_RELEASE_CANVAS = 24000;

    uint256 public promoReleaseCount;
    uint256 public standardReleaseCount;
    
    function _transfer(address _from, address _to, uint256 _canvasId) internal {
        ownershipCanvasCount[_to]++;
        canvasIdToOwner[_canvasId] = _to;
        ownershipCanvasCount[_from]--;
        delete canvasIdToApproved[_canvasId];
        
        Transfer(_from, _to, _canvasId);
    }
    
    function _approve(address _to, uint256 _canvasId) internal {
        canvasIdToApproved[_canvasId] = _to;
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

      nextX++;

      if (nextX >= MAX_COLUMNS) {
          nextX = 0;
          nextY++;
      }

      uint256 newCanvasId = canvas.push(_canvas) - 1;
      
      _transfer(0, _owner, newCanvasId);
      
      return newCanvasId;
    }


    function releasePromoCanvas() external {
        require(promoReleaseCount < MAX_PROMO_RELEASE_CANVAS);

        promoReleaseCount++;

        uint8[64] memory _red;
        uint8[64] memory _green;
        uint8[64] memory _blue;
        uint8[64] memory _alpha;

        uint256 canvasId = _createCanvas(nextX, nextY, _red, _green, _blue, _alpha, msg.sender);
        _approve(msg.sender, canvasId);
    }

    function releaseStandardCanvas() external {
        require(standardReleaseCount < MAX_STANDARD_RELEASE_CANVAS);

        standardReleaseCount++;

        uint8[64] memory _red;
        uint8[64] memory _green;
        uint8[64] memory _blue;
        uint8[64] memory _alpha;

        uint256 canvasId = _createCanvas(nextX, nextY, _red, _green, _blue, _alpha, msg.sender);
        _approve(msg.sender, canvasId);
    }

    function fillCanvas(uint256 _canvasId, uint8[64] _red, uint8[64] _green, uint8[64] _blue, uint8[64] _alpha) external {
        require(canvasIdToOwner[_canvasId] == msg.sender);

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
}