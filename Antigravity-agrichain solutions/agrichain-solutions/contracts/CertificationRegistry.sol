// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificationRegistry {
    address public owner;

    struct Certification {
        bytes32 certificateHash;
        string issuerName;
        string subject;
        string uri;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }

    mapping(bytes32 => Certification) public certifications;
    mapping(address => bool) public issuers;

    event CertificationIssued(bytes32 indexed certificateHash, string subject, address indexed issuer);
    event CertificationRevoked(bytes32 indexed certificateHash, address indexed issuer);
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

    function issueCertification(
        bytes32 certificateHash,
        string calldata issuerName,
        string calldata subject,
        string calldata uri,
        uint256 expiresAt
    ) external onlyIssuer {
        require(certificateHash != bytes32(0), "EMPTY_HASH");
        require(certifications[certificateHash].issuedAt == 0, "ALREADY_EXISTS");
        require(expiresAt > block.timestamp, "INVALID_EXPIRY");

        certifications[certificateHash] = Certification({
            certificateHash: certificateHash,
            issuerName: issuerName,
            subject: subject,
            uri: uri,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        emit CertificationIssued(certificateHash, subject, msg.sender);
    }

    function revokeCertification(bytes32 certificateHash) external onlyIssuer {
        Certification storage certification = certifications[certificateHash];
        require(certification.issuedAt != 0, "NOT_FOUND");
        certification.revoked = true;
        emit CertificationRevoked(certificateHash, msg.sender);
    }
}

