
import React, { createContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import TenderFactoryABI from '../contracts/TenderFactory.json';
import BiddingSystemABI from '../contracts/BiddingSystem.json';
import { toast } from 'react-toastify';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [tenderFactoryContract, setTenderFactoryContract] = useState(null);
  const [biddingSystemContract, setBiddingSystemContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Modern dapp browsers
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3Instance.eth.getAccounts();
            const networkId = await web3Instance.eth.net.getId();
            
            setAccounts(accounts);
            setNetworkId(networkId);
            
            // Initialize contracts
            const tenderFactory = new web3Instance.eth.Contract(
              TenderFactoryABI.abi,
              TenderFactoryABI.networks[networkId]?.address
            );
            
            const biddingSystem = new web3Instance.eth.Contract(
              BiddingSystemABI.abi,
              BiddingSystemABI.networks[networkId]?.address
            );
            
            setTenderFactoryContract(tenderFactory);
            setBiddingSystemContract(biddingSystem);
            
            // Set up event listeners for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
              setAccounts(newAccounts);
              toast.info('Account changed');
            });
            
            // Set up event listeners for network changes
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
            
          } catch (error) {
            // User denied account access
            setError('Please allow access to your Ethereum account');
            toast.error('Please allow access to your Ethereum account');
          }
        }
        // Legacy dapp browsers
        else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
          
          const accounts = await web3Instance.eth.getAccounts();
          const networkId = await web3Instance.eth.net.getId();
          
          setAccounts(accounts);
          setNetworkId(networkId);
          
          // Initialize contracts
          const tenderFactory = new web3Instance.eth.Contract(
            TenderFactoryABI.abi,
            TenderFactoryABI.networks[networkId]?.address
          );
          
          const biddingSystem = new web3Instance.eth.Contract(
            BiddingSystemABI.abi,
            BiddingSystemABI.networks[networkId]?.address
          );
          
          setTenderFactoryContract(tenderFactory);
          setBiddingSystemContract(biddingSystem);
        }
        // Non-dapp browsers
        else {
          setError('Please install MetaMask to use this application');
          toast.error('Please install MetaMask to use this application');
        }
      } catch (error) {
        setError('Error initializing Web3: ' + error.message);
        toast.error('Error initializing Web3: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        web3,
        accounts,
        networkId,
        tenderFactoryContract,
        biddingSystemContract,
        loading,
        error
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
