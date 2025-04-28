const path = require('path');

module.exports = {
  contracts_build_directory: path.join(__dirname, "../client/src/contracts"),

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Standard Ganache port
      network_id: "*",       // Match any network id
    },
  },

  compilers: {
    solc: {
      version: "0.8.20",    // Set to your Solidity version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
      }
    }
  }
};