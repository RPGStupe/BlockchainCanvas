pragma solidity ^0.4.17;

import "./ERC721.sol";
import "./CanvasModel.sol";

contract CanvasOwnership is ERC721, CanvasModel {
    
    /*** ERC721 CONSTANTS ***/
    string public constant NAME = "BlockchainCanvas";
    string public constant SYMBOL = "BC";
    
    /*** ERC721 FUNCTIONS ***/
    function implementsERC721() public pure returns (bool) {
        return true;
    }

    function totalSupply() public view returns (uint256) {
        return canvas.length;
    }    
    
    function balanceOf(address _owner) public view returns (uint256) {
        return ownershipCanvasCount[_owner];
    }
    
    function ownerOf(uint256 _canvasId) public view returns (address owner) {
        owner = canvasIdToOwner[_canvasId];

        require(owner != address(0));
    }
    
    function approve(address _to, uint256 _canvasId) public whenNotPaused {
        require(_owns(msg.sender, _canvasId));

        _approve(_to, _canvasId);
        
        Approval(msg.sender, _to, _canvasId);
    }
    
    function transferFrom(address _from, address _to, uint256 _canvasId) public whenNotPaused {
        require(_approvedFor(msg.sender, _canvasId));
        require(_owns(ownerOf(_canvasId), _canvasId));

        _transfer(_from, _to, _canvasId);
    }
    
    function transfer(address _to, uint256 _canvasId) public whenNotPaused {
        require(_to != address(0));
        require(_owns(msg.sender, _canvasId));

        _transfer(msg.sender, _to, _canvasId);
    }

    /*** OTHERS ***/
    function _owns(address _claimant, uint256 _canvasId) internal view returns (bool) {
        return canvasIdToOwner[_canvasId] == _claimant;
    }

    function _approve(address _to, uint256 _canvasId) internal {
        canvasIdToApproved[_canvasId] = _to;
    }

    function _approvedFor(address _claimant, uint256 _canvasId) internal view returns (bool) {
        return canvasIdToApproved[_canvasId] == _claimant;
    }
    
    function rescueLostCanvas(uint256 _canvasId, address _recipient) public onlyOwner whenNotPaused {
        require(_owns(this, _canvasId));
        _transfer(this, _recipient, _canvasId);
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