const User = require('../models/User');
const { getWeb3Instance } = require('../blockchain/web3Setup');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, walletAddress, organization } = req.body;
    
    // Validate wallet address format
    const web3 = getWeb3Instance();
    if (!web3.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      walletAddress,
      organization
    });
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        organization: user.organization
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        organization: user.organization
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// server/controllers/tenderController.js

const Tender = require('../models/Tender');
const User = require('../models/User');
const { getTenderFactoryContract, getWeb3Instance } = require('../blockchain/web3Setup');

// Create a new tender
exports.createTender = async (req, res, next) => {
  try {
    const { title, description, budget, deadline, category, requirements } = req.body;
    
    // Get user for wallet address
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format deadline to Unix timestamp for blockchain
    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
    
    // Create tender on blockchain
    const web3 = getWeb3Instance();
    const tenderFactoryContract = getTenderFactoryContract();
    
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // Using first account for demo; in production, use user's wallet
    
    const transaction = await tenderFactoryContract.methods
      .createTender(title, description, web3.utils.toWei(budget.toString(), 'ether'), deadlineTimestamp)
      .send({ from: account, gas: 3000000 });
    
    // Get tender ID from event
    const tenderId = transaction.events.TenderCreated.returnValues.tenderId;
    
    // Create tender in database
    const tender = await Tender.create({
      blockchainId: tenderId,
      title,
      description,
      budget,
      deadline,
      creator: req.user.id,
      creatorWallet: user.walletAddress,
      category,
      requirements: requirements || [],
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: tender,
      blockchainData: {
        tenderId,
        transactionHash: transaction.transactionHash
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all tenders
exports.getTenders = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Filter by creator if provided
    if (req.query.creator) {
      query.creator = req.query.creator;
    }
    
    const tenders = await Tender.find(query)
      .populate('creator', 'name organization')
      .populate('winningBid', 'bidder amount');
    
    res.status(200).json({
      success: true,
      count: tenders.length,
      data: tenders
    });
  } catch (error) {
    next(error);
  }
};

// Get single tender
exports.getTender = async (req, res, next) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('creator', 'name organization walletAddress')
      .populate({
        path: 'winningBid',
        populate: {
          path: 'bidder',
          select: 'name organization walletAddress'
        }
      });
    
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }
    
    // Get tender data from blockchain for verification
    const tenderFactoryContract = getTenderFactoryContract();
    const blockchainTender = await tenderFactoryContract.methods
      .getTender(tender.blockchainId)
      .call();
    
    res.status(200).json({
      success: true,
      data: tender,
      blockchainData: blockchainTender
    });
  } catch (error) {
    next(error);
  }
};

// Update tender
exports.updateTender = async (req, res, next) => {
  try {
    let tender = await Tender.findById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }
    
    // Check if user is tender creator
    if (tender.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tender'
      });
    }
    
    // Check if tender is already concluded
    if (tender.isConcluded) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a concluded tender'
      });
    }
    
    // Update only allowed fields (blockchain data can't be updated)
    const { title, description, category, requirements } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (requirements) updateData.requirements = requirements;
    
    tender = await Tender.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: tender
    });
  } catch (error) {
    next(error);
  }
};

// Conclude tender (select winning bid)
exports.concludeTender = async (req, res, next) => {
  try {
    const { bidId } = req.body;
    
    const tender = await Tender.findById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }
    
    // Check if user is tender creator
    if (tender.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to conclude this tender'
      });
    }
    
    // Check if tender is already concluded
    if (tender.isConcluded) {
      return res.status(400).json({
        success: false,
        message: 'Tender is already concluded'
      });
    }
    
    // Get bid from database
    const Bid = require('../models/Bid');
    const bid = await Bid.findById(bidId);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }
    
    // Verify bid belongs to this tender
    if (bid.tender.toString() !== tender._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Bid does not belong to this tender'
      });
    }
    
    // Conclude tender on blockchain
    const web3 = getWeb3Instance();
    const tenderFactoryContract = getTenderFactoryContract();
    
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // Using first account for demo
    
    const transaction = await tenderFactoryContract.methods
      .concludeTender(tender.blockchainId, bid.blockchainId)
      .send({ from: account, gas: 3000000 });
    
    // Update tender in database
    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      {
        isConcluded: true,
        isActive: false,
        winningBid: bidId
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedTender,
      blockchainData: {
        transactionHash: transaction.transactionHash
      }
    });
  } catch (error) {
    next(error);
  }
};

