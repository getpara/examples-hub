import { defineConfig } from "hardhat/config";

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: {
      solidity: "./src/contracts",
    },
    artifacts: "./src/contracts/artifacts",
    cache: "./cache",
  },
};

export default defineConfig(config);
