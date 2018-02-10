pragma solidity ^0.4.17;

import "./CanvasAuction.sol";

contract CanvasMinting is CanvasAuction {

    uint256 public constant MAX_CANVAS_COLUMNS = 1024;
    uint256 public constant MAX_CANVAS_ROWS = 1024;
    uint256 public constant MAX_RELEASE_CANVAS = MAX_CANVAS_COLUMNS * MAX_CANVAS_ROWS;

    uint256 public constant ROWS_PER_CYCLE = 32;
    uint256 public constant COLUMNS_PER_CYCLE = 32;
    uint256 public constant MAX_RELEASE_CYCLE_COLUMNS = MAX_CANVAS_COLUMNS / COLUMNS_PER_CYCLE;

    uint256 public releaseCanvasCount;
    uint256 public currentCycleCanvas;
    uint256 public currentCycleRow;
    uint256 public currentCycleColumn;

    uint256 public releaseStartingPrice = 10 finney;
    uint256 public releaseAuctionDuration = 1 days;

    function releaseCycleCanvas() public onlyOwner {
        require(releaseCanvasCount < MAX_RELEASE_CANVAS);

        uint8[64] memory _red;
        uint8[64] memory _green;
        uint8[64] memory _blue;
        uint8[64] memory _alpha;

        uint256 x = (currentCycleCanvas % COLUMNS_PER_CYCLE) + (currentCycleColumn * COLUMNS_PER_CYCLE);
        uint256 y = (currentCycleCanvas / COLUMNS_PER_CYCLE) + (currentCycleRow * ROWS_PER_CYCLE);
        
        releaseCanvasCount++;
        currentCycleCanvas++;

        if (currentCycleCanvas == COLUMNS_PER_CYCLE * ROWS_PER_CYCLE) {
            currentCycleCanvas = 0;
            currentCycleColumn++;
            if (currentCycleColumn == MAX_RELEASE_CYCLE_COLUMNS) {
                currentCycleColumn = 0;
                currentCycleRow++;
            }
        }

        uint256 canvasId = _createCanvas(x, y, _red, _green, _blue, _alpha, address(this));
        _approve(marketPlace, canvasId);

        marketPlace.createAuction(canvasId, _computeReleasePrice(), 0, releaseAuctionDuration, address(this));
    }

    function _computeReleasePrice() internal view returns (uint256) {
        uint256 avePrice = marketPlace.averageReleaseSalePrice();

        require(avePrice < 340282366920938463463374607431768211455);

        uint256 nextPrice = avePrice + (avePrice / 2);

        // We never auction for less than starting price
        if (nextPrice < releaseStartingPrice) {
            nextPrice = releaseStartingPrice;
        }

        return nextPrice;
    }
}