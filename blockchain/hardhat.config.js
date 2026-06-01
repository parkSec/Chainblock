import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: "https://sepolia.drpc.org",
      accounts: ["0x1e1e9e2e20fef417083c662adf0414c8c87e07e95c640258c14e6c14a0ae8f75"]
    }
  }
};
