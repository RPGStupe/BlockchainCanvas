pragma solidity ^0.4.17;

import "./ERC721.sol";
import "./MarketPlaceBase.sol";

contract MarketPlace is MarketPlaceBase {

    /// @dev The ERC-165 interface signature for ERC-721.
    ///  Ref: https://github.com/ethereum/EIPs/issues/165
    ///  Ref: https://github.com/ethereum/EIPs/issues/721
    bytes4 constant INTERFACE_SIGNATURE_ERC721 = bytes4(0x9a20483d);

    address owner = 0x00;

    function MarketPlace(uint256 _nftContract, uint _cut) public {
        require(_cut <= 10000);
        ownerCut = _cut;

        ERC721 candidateContract = ERC721(_nftContract);
        require(candidateContract.implementsERC721());
        nftContract = candidateContract;
    }

    function withdrawBalance() external {
        address nftAddress = address(nftContract);

        require(
            msg.sender == owner ||
            msg.sender == nftAddress
        );
        nftAddress.transfer(this.balance);
    }

    function createAuction(uint256 _canvasId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller) external {
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));

        require(_owns(msg.sender, _canvasId));
        _escrow(msg.sender, _canvasId);
        Auction memory auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint64(_duration),
            uint64(now)
        );
        _addAuction(_canvasId, auction);
    }

    function bidOnAuction(uint256 _canvasId) external payable {
        _bidOnAuction(_canvasId, msg.value);
        _transfer(msg.sender, _canvasId);
    }

    function cancelAuction(uint256 _canvasId) external {
        Auction storage auction = canvasIdToAuction[_canvasId];
        require(_isOnAuction(auction));
        address seller = auction.seller;
        require(msg.sender == seller);
        _cancelAuction(_canvasId, seller);
    }

    function createOffer(uint256 _canvasId, uint256 _price, address _seller) external {
        require(_owns(msg.sender, _canvasId));
        _escrow(msg.sender, _canvasId);

        Offer memory offer = Offer({
            seller: _seller, 
            price: _price
        });

        _addOffer(_canvasId, offer);
    }

    function buy(uint256 _canvasId) external payable {
        _buy(_canvasId);
        _transfer(msg.sender, _canvasId);
    }

    function cancelOffer(uint256 _canvasId) external {
        Offer storage offer = canvasIdToOffer[_canvasId];
        require(_isOnOffer(offer));
        address seller = offer.seller;
        require(msg.sender == seller);
        _cancelOffer(_canvasId, seller);
    }

    function getOffer(uint256 _canvasId) external view returns(address seller, uint256 price) {
        Offer storage offer = canvasIdToOffer[_canvasId];
        require(_isOnOffer(offer));
        return (
            offer.seller,
            offer.price
        );
    }


    function getAuction(uint256 _canvasId) external view returns (address seller, uint256 startingPrice, uint256 endingPrice, uint256 duration, uint256 startedAt) {
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

}