const Web3 = require('web3');
const TenderFactoryABI = require('../contracts/TenderFactory.json');
const BiddingSystemABI = require('../contracts/BiddingSystem.json');
const dotenv = require('dotenv');

dotenv.config();

let web3;
let tenderFactoryContract;
let biddingSystemContract;

const setupWeb3Connection = () => {
  try {
    // Connect to the blockchain node
    const providerUrl = process.env.BLOCKCHAIN_PROVIDER_URL || 'http://localhost:8545';
    web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
    
    // Initialize contract instances
    tenderFactoryContract = new web3.eth.Contract(
      TenderFactoryABI.abi,
      process.env.TENDER_FACTORY_ADDRESS
    );
    
    biddingSystemContract = new web3.eth.Contract(
      BiddingSystemABI.abi,
      process.env.BIDDING_SYSTEM_ADDRESS
    );
    
    console.log('Web3 connection established');
    return { web3, tenderFactoryContract, biddingSystemContract };
  } catch (error) {
    console.error('Error setting up Web3:', error);
    throw error;
  }
};

const getWeb3Instance = () => {
  if (!web3) {
    throw new Error('Web3 not initialized');
  }
  return web3;
};

const getTenderFactoryContract = () => {
  if (!tenderFactoryContract) {
    throw new Error('TenderFactory contract not initialized');
  }
  return tenderFactoryContract;
};

const getBiddingSystemContract = () => {
  if (!biddingSystemContract) {
    throw new Error('BiddingSystem contract not initialized');
  }
  return biddingSystemContract;
};

module.exports = {
  setupWeb3Connection,
  getWeb3Instance,
  getTenderFactoryContract,
  getBiddingSystemContract
};
