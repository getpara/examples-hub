require("@nomicfoundation/hardhat-ethers");

const config = {
  solidity: "0.8.20",
  paths: {
    root: "./src",
    sources: "./contracts",
    artifacts: "./contracts/artifacts",
  },
};

module.exports = config;
