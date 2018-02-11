pragma solidity ^0.4.17;

import "./CanvasOwnership.sol";
import "./MarketPlace.sol";

contract CanvasAuction is CanvasOwnership {
    MarketPlace public marketPlace;

    function setMarketPlaceAddress(address _address) public onlyOwner {
        MarketPlace candidateContract = MarketPlace(_address);

        require(candidateContract.isMarketPlace());

        marketPlace = candidateContract;
    }

    function withdrawMarketPlaceBalances() external onlyOwner {
        marketPlace.withdrawBalance();
    }

    function createOffer(uint256 _canvasId, uint256 _price) public whenNotPaused {
        require(_owns(msg.sender, _canvasId));
        _approve(marketPlace, _canvasId);
        marketPlace.createOffer(_canvasId, _price, msg.sender);
    }

    function createAuction(uint256 _canvasId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) public whenNotPaused {
        require(_owns(msg.sender, _canvasId));
        _approve(marketPlace, _canvasId);
        marketPlace.createAuction(_canvasId, _startingPrice, _endingPrice, _duration, msg.sender);
    }
}