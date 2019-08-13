pragma solidity ^0.5.10;

contract Ownership {
    mapping(string => address) public ownerOf;
    address public authority;

    constructor() public {
        authority = msg.sender;
    }

    function setOwner(string memory asset, address owner) public {
        ownerOf[asset] = owner;
    }
}