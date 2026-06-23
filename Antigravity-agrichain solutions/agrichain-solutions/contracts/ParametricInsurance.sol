// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ParametricInsurance
 * @dev Implements a decentralized parametric insurance mutual for farmers.
 * Payouts are triggered by an authorized Oracle based on real-world weather/satellite data.
 */
contract ParametricInsurance {
    address public owner;
    address public oracle;

    struct Policy {
        address farmer;
        string cropType;
        string location; // GeoJSON or coordinates
        uint256 threshold; // The parametric value (e.g., mm of rain)
        uint256 premium;
        uint256 coverageAmount;
        uint256 expiry;
        bool isActive;
        bool claimed;
    }

    mapping(bytes32 => Policy) public policies;
    mapping(address => uint256) public totalInsuredAmount;

    uint256 public mutualPoolBalance;

    event PolicyPurchased(bytes32 indexed policyId, address indexed farmer, uint256 premium, uint256 coverageAmount);
    event PayoutTriggered(bytes32 indexed policyId, address indexed farmer, uint256 amount);
    event OracleUpdated(address indexed newOracle);
    event MutualPoolDeposit(address indexed depositor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "NOT_ORACLE");
        _;
    }

    constructor() {
        owner = msg.sender;
        oracle = msg.sender; // Initially owner is oracle
    }

    /**
     * @dev Update the authorized oracle address.
     */
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /**
     * @dev Allows farmers to purchase an insurance policy.
     * The premium is added to the mutual pool.
     */
    function purchasePolicy(
        string calldata _cropType,
        string calldata _location,
        uint256 _threshold,
        uint256 _premium,
        uint256 _coverageAmount,
        uint256 _durationDays
    ) external payable {
        require(msg.value >= _premium, "INSUFFICIENT_PREMIUM");
        require(_durationDays > 0, "INVALID_DURATION");

        bytes32 policyId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _location));
        
        policies[policyId] = Policy({
            farmer: msg.sender,
            cropType: _cropType,
            location: _location,
            threshold: _threshold,
            premium: _premium,
            coverageAmount: _coverageAmount,
            expiry: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            claimed: false
        });

        mutualPoolBalance += msg.value;
        totalInsuredAmount[msg.sender] += _coverageAmount;

        emit PolicyPurchased(policyId, msg.sender, _premium, _coverageAmount);
    }

    /**
     * @dev Triggered by the Oracle when the parametric threshold is breached.
     */
    function triggerPayout(bytes32 _policyId) external onlyOracle {
        Policy storage policy = policies[_policyId];
        
        require(policy.isActive, "POLICY_NOT_ACTIVE");
        require(!policy.claimed, "ALREADY_CLAIMED");
        require(block.timestamp <= policy.expiry, "POLICY_EXPIRED");

        uint256 payoutAmount = policy.coverageAmount;
        require(mutualPoolBalance >= payoutAmount, "INSUFFICIENT_POOL_FUNDS");

        policy.isActive = false;
        policy.claimed = true;

        mutualPoolBalance -= payoutAmount;
        payable(policy.farmer).transfer(payoutAmount);

        emit PayoutTriggered(_policyId, policy.farmer, payoutAmount);
    }

    /**
     * @dev Emergency withdrawal of funds by the owner (with a guard).
     */
    function withdrawMutualFunds(uint256 _amount) external onlyOwner {
        require(mutualPoolBalance >= _amount, "INSUFFICIENT_FUNDS");
        mutualPoolBalance -= _amount;
        payable(owner).transfer(_amount);
    }

    /**
     * @dev Check current pool balance.
     */
    function getPoolBalance() external view returns (uint256) {
        return mutualPoolBalance;
    }
}
