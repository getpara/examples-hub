import { ethers } from "ethers";

export const FAUCET_RETURN_ADDRESS = "0x328690d91d405c14d8e4cd1306e2ca192a17d32e";
export const SEND_AMOUNT_ETH = "0.001";
const SEND_GAS_BUFFER_ETH = "0.0002";
export const SEND_MIN_BALANCE_WEI = ethers.parseEther(SEND_AMOUNT_ETH) + ethers.parseEther(SEND_GAS_BUFFER_ETH);
