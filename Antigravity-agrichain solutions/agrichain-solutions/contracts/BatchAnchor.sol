// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BatchAnchor {
    address public owner;

    struct Batch {
        bytes32 merkleRoot;
        string batchCode;
        string uri;
        address issuer;
        uint256 createdAt;
    }

    mapping(bytes32 => Batch) public batches;
    mapping(address => bool) public issuers;

    event BatchAnchored(bytes32 indexed merkleRoot, string batchCode, string uri, address indexed issuer);
    event IssuerUpdated(address indexed issuer, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender] || msg.sender == owner, "NOT_ISSUER");
        _;
    }

    constructor() {
        owner = msg.sender;
        issuers[msg.sender] = true;
    }

    function setIssuer(address issuer, bool allowed) external onlyOwner {
        issuers[issuer] = allowed;
        emit IssuerUpdated(issuer, allowed);
    }

    function anchorBatch(bytes32 merkleRoot, string calldata batchCode, string calldata uri) external onlyIssuer {
        require(merkleRoot != bytes32(0), "EMPTY_ROOT");
        require(batches[merkleRoot].createdAt == 0, "ALREADY_ANCHORED");

        batches[merkleRoot] = Batch({
            merkleRoot: merkleRoot,
            batchCode: batchCode,
            uri: uri,
            issuer: msg.sender,
            createdAt: block.timestamp
        });

        emit BatchAnchored(merkleRoot, batchCode, uri, msg.sender);
    }
}

