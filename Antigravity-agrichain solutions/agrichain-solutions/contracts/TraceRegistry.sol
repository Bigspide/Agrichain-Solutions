// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TraceRegistry {
    address public owner;

    struct TraceAnchor {
        bytes32 payloadHash;
        string traceCode;
        string uri;
        address issuer;
        uint256 createdAt;
        bool revoked;
    }

    mapping(bytes32 => TraceAnchor) public anchors;
    mapping(address => bool) public issuers;

    event IssuerUpdated(address indexed issuer, bool allowed);
    event TraceAnchored(bytes32 indexed payloadHash, string traceCode, string uri, address indexed issuer);
    event TraceRevoked(bytes32 indexed payloadHash, address indexed issuer);

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

    function anchorTrace(bytes32 payloadHash, string calldata traceCode, string calldata uri) external onlyIssuer {
        require(payloadHash != bytes32(0), "EMPTY_HASH");
        require(anchors[payloadHash].createdAt == 0, "ALREADY_ANCHORED");

        anchors[payloadHash] = TraceAnchor({
            payloadHash: payloadHash,
            traceCode: traceCode,
            uri: uri,
            issuer: msg.sender,
            createdAt: block.timestamp,
            revoked: false
        });

        emit TraceAnchored(payloadHash, traceCode, uri, msg.sender);
    }

    function revokeTrace(bytes32 payloadHash) external onlyIssuer {
        TraceAnchor storage anchor = anchors[payloadHash];
        require(anchor.createdAt != 0, "NOT_FOUND");
        require(anchor.issuer == msg.sender || msg.sender == owner, "NOT_ANCHOR_ISSUER");
        anchor.revoked = true;
        emit TraceRevoked(payloadHash, msg.sender);
    }
}

