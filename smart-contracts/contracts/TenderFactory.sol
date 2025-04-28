// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TenderFactory
 * @dev Contract for creating and managing tenders
 */
contract TenderFactory {
    address public owner;
    mapping(uint256 => Tender) public tenders;
    uint256 public tenderCount;
    
    struct Tender {
        uint256 id;
        string title;
        string description;
        uint256 budget;
        uint256 deadline;
        address creator;
        bool isActive;
        uint256 winningBidId;
        bool isConcluded;
    }
    
    event TenderCreated(uint256 indexed tenderId, string title, address creator);
    event TenderConcluded(uint256 indexed tenderId, uint256 winningBidId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        tenderCount = 0;
    }
    
    function createTender(
        string memory _title,
        string memory _description,
        uint256 _budget,
        uint256 _deadline
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        uint256 tenderId = tenderCount++;
        tenders[tenderId] = Tender({
            id: tenderId,
            title: _title,
            description: _description,
            budget: _budget,
            deadline: _deadline,
            creator: msg.sender,
            isActive: true,
            winningBidId: 0,
            isConcluded: false
        });
        
        emit TenderCreated(tenderId, _title, msg.sender);
        return tenderId;
    }
    
    function getTender(uint256 _tenderId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 budget,
        uint256 deadline,
        address creator,
        bool isActive,
        uint256 winningBidId,
        bool isConcluded
    ) {
        Tender storage tender = tenders[_tenderId];
        return (
            tender.id,
            tender.title,
            tender.description,
            tender.budget,
            tender.deadline,
            tender.creator,
            tender.isActive,
            tender.winningBidId,
            tender.isConcluded
        );
    }
    
    function concludeTender(uint256 _tenderId, uint256 _winningBidId) public {
        Tender storage tender = tenders[_tenderId];
        require(msg.sender == tender.creator, "Only tender creator can conclude");
        require(tender.isActive, "Tender is not active");
        require(!tender.isConcluded, "Tender already concluded");
        
        tender.isActive = false;
        tender.isConcluded = true;
        tender.winningBidId = _winningBidId;
        
        emit TenderConcluded(_tenderId, _winningBidId);
    }
}

