pragma solidity ^0.5.10;

contract Comments {
    mapping(string => string[]) public comments;
    address public authority;

    constructor() public {
        authority = msg.sender;
    }

    function postComment(string memory asset, string memory comment) public {
        comments[asset].push(comment);
    }
}