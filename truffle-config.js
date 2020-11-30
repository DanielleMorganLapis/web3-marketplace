var fs = require('fs');

var HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = fs.readFileSync(".secret").toString().trim();
const infuraKey = fs.readFileSync(".infurakey").toString().trim();
module.exports = {

  plugins: ["truffle-security"],

  contracts_build_directory: "./client/src/contracts",
  compilers: {
    solc: {
      version: "0.5.16", // A version or constraint - Ex. "^0.5.0"
     // version: "0.6.0",
                         // Can also be set to "native" to use a native solc
      parser: "solcjs",  // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: false,
          runs: 30   // Optimize for how many times you intend to run the code
        },
        evmVersion: "petersburg"// Default: "petersburg"
      },
    },
  },

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,     // port 7545 for Ganache GUI version and port 8545 for Ganache-cli
      network_id: "*" // Match any network id

    },

    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + infuraKey);
      },
      network_id: 4
    }

  }
};
