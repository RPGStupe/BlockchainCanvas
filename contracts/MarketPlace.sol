pragma solidity ^0.4.17;

import "./ERC721.sol";
import "./MarketPlaceBase.sol";
import "./Pausable.sol";

contract MarketPlace is MarketPlaceBase, Pausable {

    /// @dev The ERC-165 interface signature for ERC-721.
    ///  Ref: https://github.com/ethereum/EIPs/issues/165
    ///  Ref: https://github.com/ethereum/EIPs/issues/721
    bytes4 constant INTERFACE_SIGNATURE_ERC721 = bytes4(0x9a20483d);

    bool public isMarketPlace = true;

    uint256 public releaseSaleCount;
    uint256[5] public lastReleaseSalePrices;

    function MarketPlace(uint256 _nftContract, uint _cut) public {
        require(_cut <= 10000);
        ownerCut = _cut;

        ERC721 candidateContract = ERC721(_nftContract);
        require(candidateContract.implementsERC721());
        nftContract = candidateContract;
    }

    function withdrawBalance() external {
        address nftAddress = address(nftContract);

        require(msg.sender == nftAddress);

        nftAddress.transfer(this.balance);
    }

    function createAuction(
        uint256 _canvasId, 
        uint256 _startingPrice, 
        uint256 _endingPrice, 
        uint256 _duration, 
        address _seller
    ) 
        public 
        canBeStoredWith128Bits(_startingPrice) 
        canBeStoredWith128Bits(_endingPrice) 
        canBeStoredWith64Bits(_duration) 
        whenNotPaused 
    {
        require(msg.sender == address(nftContract));
        _escrow(_seller, _canvasId);

        Auction memory auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint64(_duration),
            uint64(now)
        );
        _addAuction(_canvasId, auction);
    }

    function bidOnAuction(uint256 _canvasId) public payable whenNotPaused {
        _bidOnAuction(_canvasId, msg.value);
        _transfer(msg.sender, _canvasId);
    }

    function cancelAuction(uint256 _canvasId) public {
        Auction storage auction = canvasIdToAuction[_canvasId];
        require(_isOnAuction(auction));
        address seller = auction.seller;
        require(msg.sender == seller);
        _cancelAuction(_canvasId, seller);
    }

    function createOffer(
        uint256 _canvasId, 
        uint256 _price, 
        address _seller
    ) 
        public 
        whenNotPaused 
        canBeStoredWith128Bits(_price) 
    {
        require(msg.sender == address(nftContract));
        _escrow(_seller, _canvasId);

        Offer memory offer = Offer({
            seller: _seller, 
            price: _price
        });
        _addOffer(_canvasId, offer);
    }

    function buy(uint256 _canvasId) public payable whenNotPaused {
        _buy(_canvasId);
        _transfer(msg.sender, _canvasId);
    }

    function cancelOffer(uint256 _canvasId) public {
        Offer storage offer = canvasIdToOffer[_canvasId];
        require(_isOnOffer(offer));
        address seller = offer.seller;
        require(msg.sender == seller);
        _cancelOffer(_canvasId, seller);
    }

    function getOffer(uint256 _canvasId) public view returns(address seller, uint256 price) {
        Offer storage offer = canvasIdToOffer[_canvasId];
        require(_isOnOffer(offer));
        return (
            offer.seller,
            offer.price
        );
    }

    function getAuction(uint256 _canvasId) public view returns (address seller, uint256 startingPrice, uint256 endingPrice, uint256 duration, uint256 startedAt) {
        Auction storage auction = canvasIdToAuction[_canvasId];
        require(_isOnAuction(auction));
        return (
            auction.seller,
            auction.startingPrice,
            auction.endingPrice,
            auction.duration,
            auction.startedAt
        );
    }

    function averageReleaseSalePrice() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < 5; i++) {
            sum += lastReleaseSalePrices[i];
        }
        return sum / 5;
    }

}