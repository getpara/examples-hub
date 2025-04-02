import { ethers } from "ethers";
import { HOLESKY_RPC_URL } from "../constants";

export const provider = new ethers.JsonRpcProvider(HOLESKY_RPC_URL);
