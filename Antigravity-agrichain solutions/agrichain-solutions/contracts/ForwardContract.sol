// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ForwardContract
 * @dev Implements a trustless Escrow system for agricultural Forward Contracts.
 * Allows buyers and sellers to lock in prices and quantities before harvest.
 */
contract ForwardContract {
    address public owner;

    enum ContractStatus { PENDING, ACTIVE, DELIVERED, DISPUTED, CANCELLED }

    struct Agreement {
        address buyer;
        address seller;
        string cropType;
        uint256 quantity; // In kg or tons
        uint256 agreedPrice; // Price per unit
        uint256 deposit; // Escrow amount
        uint256 deliveryDate;
        ContractStatus status;
        string batchCode; // Linked to BatchAnchor
    }

    mapping(bytes32 => Agreement) public agreements;
    mapping(address => bytes32[]) public buyerContracts;
    mapping(address => bytes32[]) public sellerContracts;

    event ContractCreated(bytes32 indexed contractId, address indexed buyer, address indexed seller, uint256 totalValue);
    event FundsDeposited(bytes32 indexed contractId, uint256 amount);
    event DeliveryConfirmed(bytes32 indexed contractId);
    event FundsReleased(bytes32 indexed contractId, uint256 amount);
    event ContractDisputed(bytes32 indexed contractId, string reason);
    event ContractCancelled(bytes32 indexed contractId);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Creates a forward contract agreement.
     */
    function createAgreement(
        address _seller,
        string calldata _cropType,
        uint256 _quantity,
        uint256 _agreedPrice,
        uint256 _deliveryDate,
        string calldata _batchCode
    ) external payable {
        require(msg.value > 0, "DEPOSIT_REQUIRED");
        
        bytes32 contractId = keccak256(abi.encodePacked(msg.sender, _seller, block.timestamp));
        
        agreements[contractId] = Agreement({
            buyer: msg.sender,
            seller: _seller,
            cropType: _cropType,
            quantity: _quantity,
            agreedPrice: _agreedPrice,
            deposit: msg.value,
            deliveryDate: _deliveryDate,
            status: ContractStatus.ACTIVE,
            batchCode: _batchCode
        });

        buyerContracts[msg.sender].push(contractId);
        sellerContracts[_seller].push(contractId);

        emit ContractCreated(contractId, msg.sender, _seller, _quantity * _agreedPrice);
        emit FundsDeposited(contractId, msg.value);
    }

    /**
     * @dev Buyer confirms the delivery of the agricultural products.
     */
    function confirmDelivery(bytes32 _contractId) external {
        Agreement storage agreement = agreements[_contractId];
        require(msg.sender == agreement.buyer, "ONLY_BUYER_CAN_CONFIRM");
        require(agreement.status == ContractStatus.ACTIVE, "NOT_ACTIVE");

        agreement.status = ContractStatus.DELIVERED;
        
        uint256 totalValue = agreement.quantity * agreement.agreedPrice;
        // In a real system, we would handle the remaining payment here.
        // For this escrow, we release the deposit to the seller.
        payable(agreement.seller).transfer(agreement.deposit);

        emit DeliveryConfirmed(_contractId);
        emit FundsReleased(_contractId, agreement.deposit);
    }

    /**
     * @dev Trigger a dispute if delivery is not as agreed.
     */
    function disputeContract(bytes32 _contractId, string calldata _reason) external {
        Agreement storage agreement = agreements[_contractId];
        require(msg.sender == agreement.buyer || msg.sender == agreement.seller, "NOT_PARTY_TO_CONTRACT");
        
        agreement.status = ContractStatus.DISPUTED;
        emit ContractDisputed(_contractId, _reason);
    }

    /**
     * @dev Owner can resolve disputes (Arbitration).
     */
    function resolveDispute(bytes32 _contractId, address _winner) external onlyOwner {
        Agreement storage agreement = agreements[_contractId];
        require(agreement.status == ContractStatus.DISPUTED, "NOT_DISPUTED");
        require(_winner == agreement.buyer || _winner == agreement.seller, "INVALID_WINNER");

        agreement.status = ContractStatus.CANCELLED;
        payable(_winner).transfer(agreement.deposit);
    }

    function getBuyerContracts() external view returns (bytes32[] memory) {
        return buyerContracts[msg.sender];
    }

    function getSellerContracts() external view returns (bytes32[] memory) {
        return sellerContracts[msg.sender];
    }
}
