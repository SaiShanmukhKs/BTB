/**
 * @title BiddingSystem
 * @dev Contract for managing bids for tenders
 */
contract BiddingSystem {
    address public owner;
    TenderFactory public tenderFactory;
    
    struct Bid {
        uint256 id;
        uint256 tenderId;
        address bidder;
        uint256 amount;
        string proposalHash; // IPFS hash of the detailed proposal
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(uint256 => mapping(uint256 => Bid)) public bids; // tenderId => bidId => Bid
    mapping(uint256 => uint256) public bidCountPerTender; // tenderId => bidCount
    
    event BidSubmitted(uint256 indexed tenderId, uint256 indexed bidId, address bidder);
    event BidInvalidated(uint256 indexed tenderId, uint256 indexed bidId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _tenderFactoryAddress) {
        owner = msg.sender;
        tenderFactory = TenderFactory(_tenderFactoryAddress);
    }
    
    function submitBid(
        uint256 _tenderId,
        uint256 _amount,
        string memory _proposalHash
    ) public returns (uint256) {
        // Get tender details to check validity
        (
            ,
            ,
            ,
            uint256 budget,
            uint256 deadline,
            ,
            bool isActive,
            ,
            bool isConcluded
        ) = tenderFactory.getTender(_tenderId);
        
        require(isActive, "Tender is not active");
        require(!isConcluded, "Tender is already concluded");
        require(block.timestamp < deadline, "Tender deadline has passed");
        require(_amount <= budget, "Bid amount exceeds tender budget");
        
        uint256 bidId = bidCountPerTender[_tenderId]++;
        
        bids[_tenderId][bidId] = Bid({
            id: bidId,
            tenderId: _tenderId,
            bidder: msg.sender,
            amount: _amount,
            proposalHash: _proposalHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        emit BidSubmitted(_tenderId, bidId, msg.sender);
        return bidId;
    }
    
    function getBid(uint256 _tenderId, uint256 _bidId) public view returns (
        uint256 id,
        uint256 tenderId,
        address bidder,
        uint256 amount,
        string memory proposalHash,
        uint256 timestamp,
        bool isValid
    ) {
        Bid storage bid = bids[_tenderId][_bidId];
        return (
            bid.id,
            bid.tenderId,
            bid.bidder,
            bid.amount,
            bid.proposalHash,
            bid.timestamp,
            bid.isValid
        );
    }
    
    function invalidateBid(uint256 _tenderId, uint256 _bidId) public {
        Bid storage bid = bids[_tenderId][_bidId];
        
        // Get tender details to check authority
        (
            ,
            ,
            ,
            ,
            ,
            address creator,
            ,
            ,
            
        ) = tenderFactory.getTender(_tenderId);
        
        require(msg.sender == creator, "Only tender creator can invalidate bids");
        require(bid.isValid, "Bid is already invalidated");
        
        bid.isValid = false;
        
        emit BidInvalidated(_tenderId, _bidId);
    }
    
    function getBidCount(uint256 _tenderId) public view returns (uint256) {
        return bidCountPerTender[_tenderId];
    }
}
