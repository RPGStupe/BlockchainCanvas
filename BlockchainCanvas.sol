pragma solidity ^0.4.19;

/// @title Interface for contracts conforming to ERC-721: Non-Fungible Tokens
contract ERC721 {
    // Required methods
    function totalSupply() public view returns (uint256 total);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerOf(uint256 _tokenId) external view returns (address owner);
    function approve(address _to, uint256 _tokenId) external;
    function transfer(address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    // Events
    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);

    // Optional
    // function name() public view returns (string name);
    // function symbol() public view returns (string symbol);
    // function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds);
    // function tokenMetadata(uint256 _tokenId, string _preferredTransport) public view returns (string infoUrl);

    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}

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
        canvas[_canvasId].green = _blue;
        canvas[_canvasId].green = _alpha;

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

contract CanvasOwnership is ERC721, CanvasModel {
    
    string public constant NAME = "BlockchainCanvas";
    string public constant SYMBOL = "BC";
    
    bytes4 constant INTERFACE_SIGNATURE_ERC165 =
        bytes4(keccak256("supportsInterface(bytes4)"));

    bytes4 constant INTERFACE_SIGNATURE_ERC721 =
        bytes4(keccak256("name()")) ^ bytes4(keccak256("symbol()")) ^ bytes4(keccak256("totalSupply()")) ^ bytes4(keccak256("balanceOf(address)")) ^ bytes4(keccak256("ownerOf(uint256)")) ^ bytes4(keccak256("approve(address,uint256)")) ^ bytes4(keccak256("transfer(address,uint256)")) ^ bytes4(keccak256("transferFrom(address,address,uint256)")) ^ bytes4(keccak256("tokensOfOwner(address)")) ^ bytes4(keccak256("tokenMetadata(uint256,string)"));
    
    function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
        // DEBUG ONLY
        //require((INTERFACE_SIGNATURE_ERC165 == 0x01ffc9a7) && (INTERFACE_SIGNATURE_ERC721 == 0x9a20483d));

        return ((_interfaceID == INTERFACE_SIGNATURE_ERC165) || (_interfaceID == INTERFACE_SIGNATURE_ERC721));
    }
    
    function totalSupply() public view returns (uint256) {
        return canvas.length;
    }
    
    function balanceOf(address _owner) public view returns (uint256) {
        return ownershipCanvasCount[_owner];
    }
    
    function ownerOf(uint256 _canvasId) external view returns (address) {
        return canvasIdToOwner[_canvasId];
    }
    
    function approve(address _to, uint256 _canvasId) external {
        _approve(_to, _canvasId);
        
        Approval(msg.sender, _to, _canvasId);
    }
    
    function transferFrom(address _from, address _to, uint256 _canvasId) external {
        _transfer(_from, _to, _canvasId);
    }
    
    function transfer(address _to, uint256 _canvasId) external {
        _transfer(msg.sender, _to, _canvasId);
    }
    
    /// @dev This method MUST NEVER be called by smart contract code. First, it's fairly
    ///  expensive (it walks the entire Canvas array looking for canvas' belonging to _owner),
    ///  but it also returns a dynamic array, which is only supported for web3 calls, and
    ///  not contract-to-contract calls.
    function tokensOfOwner(address _owner) external view returns (uint256[] canvasIds) {
        uint256 tokenCount = balanceOf(_owner);
        
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalCanvass = totalSupply();
            uint256 resultIndex = 0;
            
            uint256 _canvasId;
            
            for (_canvasId = 0; _canvasId <= totalCanvass; _canvasId++) {
                if (canvasIdToOwner[_canvasId] == _owner) {
                    result[resultIndex] = _canvasId;
                    resultIndex++;
                }
            }
        }

        return result;
    }
}

contract MarketPlaceBase {

    struct Offer {
        address seller;
        uint256 price;
    }

    ERC721 public nftContract;

    mapping (uint256 => Offer) canvasIdToOffer;

    event OfferCreated(uint256 canvasId, uint256 price);
    event OfferSuccessful(uint256 canvasId, uint256 price, address buyer);
    event OfferCancelled(uint256 canvasId);

    function _owns(address _claimant, uint256 _canvasId) internal view returns(bool) {
        return (nftContract.ownerOf(_canvasId) == _claimant);
    }

    function _escrow(address _owner, uint256 _canvasId) internal {

        nftContract.transferFrom(_owner, this, _canvasId);
    }

    function _transfer(address _receiver, uint256 _canvasId) internal {
        nftContract.transfer(_receiver, _canvasId);
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
        require (msg.value >= offer.price);
        address seller = offer.seller;

        _removeOffer(_canvasId);

        if (offer.price > 0) {
            seller.transfer(offer.price);
        }

        uint256 change = msg.value - offer.price;

        if (change > 0) {
            msg.sender.transfer(change);
        }

        OfferSuccessful(_canvasId, offer.price, msg.sender);

        return offer.price;
    }

    function _removeOffer(uint256 _canvasId) internal {
        delete canvasIdToOffer[_canvasId];
    }

    function _isOnOffer(Offer storage _offer) internal view returns (bool) {
        return (_offer.price > 0);
    }
}

contract MarketPlace is MarketPlaceBase {

    /// @dev The ERC-165 interface signature for ERC-721.
    ///  Ref: https://github.com/ethereum/EIPs/issues/165
    ///  Ref: https://github.com/ethereum/EIPs/issues/721
    bytes4 constant INTERFACE_SIGNATURE_ERC721 = bytes4(0x9a20483d);

    address owner = 0x00;

    function MarketPlace(uint256 _nftContract) public {
        ERC721 candidateContract = ERC721(_nftContract);
        require(candidateContract.supportsInterface(INTERFACE_SIGNATURE_ERC721));
        nftContract = candidateContract;
    }

    function withdrawBalance() external {
        address nftAddress = address(nftContract);

        require(
            msg.sender == owner ||
            msg.sender == nftAddress
        );
        // We are using this boolean method to make sure that even if one fails it will still work
        nftAddress.transfer(this.balance);
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

}