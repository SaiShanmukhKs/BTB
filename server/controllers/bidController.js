const Bid = require('../models/Bid');
const Tender = require('../models/Tender');
const User = require('../models/User');
const { getBiddingSystemContract, getWeb3Instance } = require('../blockchain/web3Setup');

// Submit a new bid
exports.submitBid = async (req, res, next) => {
  try {
    const { tenderId, amount, proposalDetails, proposalHash, documents } = req.body;

    // Check if tender exists
    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found',
      });
    }

    // Check if tender is active
    if (!tender.isActive || tender.isConcluded) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on inactive or concluded tender',
      });
    }

    // Check if deadline has passed
    if (new Date(tender.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tender deadline has passed',
      });
    }

    // Get bidder's wallet address
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Submit bid to blockchain
    const web3 = getWeb3Instance();
    const biddingSystemContract = getBiddingSystemContract();

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // Using first account for demo

    const transaction = await biddingSystemContract.methods
      .submitBid(
        tender.blockchainId,
        web3.utils.toWei(amount.toString(), 'ether'),
        proposalHash
      )
      .send({ from: account, gas: 3000000 });

    // Get bid ID from transaction
    const bidId = transaction.events.BidSubmitted.returnValues.bidId;

    // Create bid in database
    const bid = await Bid.create({
      blockchainId: bidId,
      tender: tenderId,
      tenderBlockchainId: tender.blockchainId,
      bidder: req.user.id,
      bidderWallet: user.walletAddress,
      amount,
      proposalHash,
      proposalDetails,
      documents: documents || [],
      isValid: true,
    });

    res.status(201).json({
      success: true,
      data: bid,
      blockchainData: {
        bidId,
        transactionHash: transaction.transactionHash,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all bids for a tender
exports.getBidsForTender = async (req, res, next) => {
  try {
    const tender = await Tender.findById(req.params.tenderId);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found',
      });
    }

    // Check authorization
    const isCreator = tender.creator.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // If not creator or admin, can only see own bids
    let query = { tender: req.params.tenderId };
    if (!isCreator && !isAdmin) {
      query.bidder = req.user.id;
    }

    const bids = await Bid.find(query)
      .populate('bidder', 'name organization walletAddress')
      .populate('tender', 'title blockchainId');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

// Get single bid
exports.getBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('bidder', 'name organization walletAddress')
      .populate('tender', 'title blockchainId creator');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Check authorization
    const isBidder = bid.bidder._id.toString() === req.user.id;
    const isTenderCreator = bid.tender.creator.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isBidder && !isTenderCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this bid',
      });
    }

    // Get bid data from blockchain for verification
    const biddingSystemContract = getBiddingSystemContract();
    const blockchainBid = await biddingSystemContract.methods
      .getBid(bid.tenderBlockchainId, bid.blockchainId)
      .call();

    res.status(200).json({
      success: true,
      data: bid,
      blockchainData: blockchainBid,
    });
  } catch (error) {
    next(error);
  }
};

// Update bid
exports.updateBid = async (req, res, next) => {
  try {
    let bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Check if user is bid creator
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bid',
      });
    }

    // Check if tender is active
    const tender = await Tender.findById(bid.tender);
    if (tender.isConcluded) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update bid on concluded tender',
      });
    }

    // Check if deadline has passed
    if (new Date(tender.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tender deadline has passed',
      });
    }

    // Update only allowed fields (blockchain data can't be updated)
    const { proposalDetails, documents } = req.body;
    const updateData = {};

    if (proposalDetails) updateData.proposalDetails = proposalDetails;
    if (documents) updateData.documents = documents;

    bid = await Bid.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

// Invalidate bid (tender creator only)
exports.invalidateBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('tender', 'creator blockchainId');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Check if user is tender creator or admin
    if (bid.tender.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to invalidate this bid',
      });
    }

    // Invalidate bid on blockchain
    const web3 = getWeb3Instance();
    const biddingSystemContract = getBiddingSystemContract();

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // Using first account for demo

    const transaction = await biddingSystemContract.methods
      .invalidateBid(bid.tender.blockchainId, bid.blockchainId)
      .send({ from: account, gas: 3000000 });

    // Update bid in database
    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      { isValid: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBid,
      blockchainData: {
        transactionHash: transaction.transactionHash,
      },
    });
  } catch (error) {
    next(error);
  }
};
