// SPDX-License-Identifier: MIT
// (c)2024 Atlas (atlas@cryptolink.tech)
pragma solidity =0.8.17;

import "@cryptolink/contracts/message/MessageClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract HelloERC721 is ERC721, MessageClient {
    uint public nextNftId;

    constructor() ERC721("Hello ERC721!", "H721") {
        nextNftId = block.chainid * 10 ** 4;
    }

    function mint() external {
        _mint(msg.sender, nextNftId);
        nextNftId++;
    }

    function bridge(
        uint _destChainId,
        bytes32 _recipient,
        uint _nftId
    ) external onlyActiveChain(_destChainId) {
        require(
            ownerOf(_nftId) == msg.sender,
            "HelloERC721: caller is not the owner of the nft"
        );

        string memory uri = tokenURI(_nftId);

        // burn nft
        _burn(_nftId);

        // send cross chain message
        _sendMessage(_destChainId, abi.encode(_recipient, uri));
    }

    function messageProcess(
        uint,
        uint _sourceChainId,
        address _sender,
        address,
        uint,
        bytes calldata _data
    ) external override onlySelf(_sender, _sourceChainId) {
        // decode message
        (address _recipient, uint _nftId) = abi.decode(_data, (address, uint));

        // mint tokens
        _mint(_recipient, _nftId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return "https://shorturl.at/fuwT0";
    }
}
