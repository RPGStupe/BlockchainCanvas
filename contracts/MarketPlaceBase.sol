pragma solidity ^0.4.17;

import "./ERC721.sol";

contract MarketPlaceBase {

    /*** EVENTS ***/
    event OfferCreated(uint256 canvasId, uint256 price);
    event OfferSuccessful(uint256 canvasId, uint256 price, address buyer);
    event OfferCancelled(uint256 canvasId);

    event AuctionCreated(uint256 canvasId, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    event AuctionSuccessful(uint256 canvasId, uint256 totalPrice, address winner);
    event AuctionCancelled(uint256 canvasId);

    /*** DATA TYPES ***/
    struct Offer {
        address seller;
        uint256 price;
    }

    struct Auction {
        address seller;
        uint128 startingPrice;
        uint128 endingPrice;
        uint64 duration;
        uint64 startedAt;
    }

    // Modifiers to check that inputs can be safely stored with a certain
    // number of bits. We use constants and multiple modifiers to save gas.
    modifier canBeStoredWith64Bits(uint256 _value) {
        require(_value <= 18446744073709551615);
        _;
    }

    modifier canBeStoredWith128Bits(uint256 _value) {
        require(_value < 340282366920938463463374607431768211455);
        _;
    }

    /*** STORAGE ***/
    ERC721 public nftContract;
    
    // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut;

    mapping (uint256 => Offer) canvasIdToOffer;
    mapping (uint256 => Auction) canvasIdToAuction;

    function() external {}

    function _owns(address _claimant, uint256 _canvasId) internal view returns(bool) {
        return (nftContract.ownerOf(_canvasId) == _claimant);
    }

    function _escrow(address _owner, uint256 _canvasId) internal {
        nftContract.transferFrom(_owner, this, _canvasId);
    }

    function _transfer(address _receiver, uint256 _canvasId) internal {
        nftContract.transfer(_receiver, _canvasId);
    }


    function _addAuction(uint256 _canvasId, Auction _auction) internal {
        require(_auction.duration >= 1 minutes);

        canvasIdToAuction[_canvasId] = _auction;

        AuctionCreated(
            uint256(_canvasId),
            uint256(_auction.startingPrice),
            uint256(_auction.endingPrice),
            uint256(_auction.duration)
        );
    }

    function _cancelAuction(uint256 _canvasId, address _seller) internal {
        _removeAuction(_canvasId);
        _transfer(_seller, _canvasId);
        AuctionCancelled(_canvasId);
    }

    function _bidOnAuction(uint256 _canvasId, uint256 _bidAmount) internal returns (uint256) {
        Auction storage auction = canvasIdToAuction[_canvasId];

        require(_isOnAuction(auction));

        uint256 price = _currentPrice(auction);
        require(_bidAmount >= price);

        address seller = auction.seller;

        _removeAuction(_canvasId);

        if (price > 0) {
            uint256 auctioneerCut = _computeCut(price);
            uint256 sellerProceeds = price - auctioneerCut;

            seller.transfer(sellerProceeds);
        }

        uint256 bidExcess = _bidAmount - price;

        msg.sender.transfer(bidExcess);

        AuctionSuccessful(_canvasId, price, msg.sender);

        return price;
    }

    function _currentPrice(Auction storage _auction) internal view returns (uint256) {
        uint256 secondsPassed = 0;

        if (now > _auction.startedAt) {
            secondsPassed = now - _auction.startedAt;
        }

        return _computeCurrentPrice(
            _auction.startingPrice,
            _auction.endingPrice,
            _auction.duration,
            secondsPassed
        );
    }

    function _computeCurrentPrice(uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, uint256 _secondsPassed ) internal pure returns (uint256) {
        if (_secondsPassed >= _duration) {
            return _endingPrice;
        } else {
            int256 totalPriceChange = int256(_endingPrice) - int256(_startingPrice);

            int256 currentPriceChange = totalPriceChange * int256(_secondsPassed) / int256(_duration);

            int256 currentPrice = int256(_startingPrice) + currentPriceChange;

            return uint256(currentPrice);
        }
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {
        return _price * ownerCut / 10000;
    }

    function _removeAuction(uint256 _canvasId) internal {
        delete canvasIdToAuction[_canvasId];
    }

    function _isOnAuction(Auction storage _auction) internal view returns (bool) {
        return (_auction.startedAt > 0);
    }


    function _addOffer(uint256 _canvasId, Offer _offer) internal {
        canvasIdToOffer[_canvasId] = _offer;

        OfferCreated(_canvasId, _offer.price);
    }

    function _cancelOffer(uint256 _canvasId, address _seller) internal {
        _removeOffer(_canvasId);
        _transfer(_seller, _canvasId);
        OfferCancelled(_canvasId);
    }

    function _buy(uint256 _canvasId) internal returns (uint256) {
        Offer storage offer = canvasIdToOffer[_canvasId];

        require(_isOnOffer(offer));

        uint256 price = offer.price;
        require(msg.value >= price);

        address seller = offer.seller;

        _removeOffer(_canvasId);

        if (price > 0) {
            uint256 auctioneerCut = _computeCut(price);
            uint256 sellerProceeds = price - auctioneerCut;

            seller.transfer(sellerProceeds);
        }

        uint256 buyExcess = msg.value - price;

        msg.sender.transfer(buyExcess);

        OfferSuccessful(_canvasId, price, msg.sender);

        return price;
    }

    function _removeOffer(uint256 _canvasId) internal {
        delete canvasIdToOffer[_canvasId];
    }

    function _isOnOffer(Offer storage _offer) internal view returns (bool) {
        return (_offer.price > 0);
    }
}