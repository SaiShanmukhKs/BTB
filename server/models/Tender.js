const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  creatorWallet: {
    type: String,
    required: [true, 'Please add creator wallet address']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Construction',
      'IT Services',
      'Supply Chain',
      'Consulting',
      'Healthcare',
      'Other'
    ]
  },
  requirements: [{
    type: String
  }],
  documents: [{
    title: String,
    fileHash: String, // IPFS hash
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isConcluded: {
    type: Boolean,
    default: false
  },
  winningBid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tender', TenderSchema);
