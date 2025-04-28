const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true
  },
  tender: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tender',
    required: true
  },
  tenderBlockchainId: {
    type: Number,
    required: true
  },
  bidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  bidderWallet: {
    type: String,
    required: [true, 'Please add bidder wallet address']
  },
  amount: {
    type: Number,
    required: [true, 'Please add bid amount']
  },
  proposalHash: {
    type: String,
    required: [true, 'Please add proposal hash']
  },
  proposalDetails: {
    title: String,
    description: String,
    timeline: String,
    methodology: String,
    team: [{
      name: String,
      role: String,
      experience: String
    }]
  },
  documents: [{
    title: String,
    fileHash: String, // IPFS hash
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isValid: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bid', BidSchema);
