import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 56,
    },
    hardhat: {},
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY || "",
    customChains: [
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
