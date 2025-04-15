import ParaCore from '@getpara/core-sdk';
import { ethers } from 'ethers';

/**
 * Creates a Sepolia test transaction to sign and validate that your Para application is properly working.
 * The transaction, if broadcast, simply sends 0.01 ETH from the wallet back to itself.
 * @param {ParaCore} para your Para instance
 * @param {string} walletId the EVM wallet ID to use.
 * @returns {Promise<ethers.Transaction>} the generated transaction.
 */
export async function createTestTransaction(para: ParaCore, walletId?: string): Promise<ethers.Transaction> {
  walletId = para.findWalletId(walletId, { type: ['EVM'] });

  const wallet = para.wallets[walletId];

  const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/FPFN1k9stEKGzGNnoIveEuEhuDygTisx');
  const address = para.getDisplayAddress(wallet.id, { addressType: 'EVM' });

  const eip1559Fees = await provider.getFeeData();
  const nonce = wallet.address ? await provider.getTransactionCount(address) : undefined;

  return ethers.Transaction.from({
    to: address,
    value: ethers.parseUnits('0.01', 'ether'),
    chainId: '11155111',
    type: 2,
    nonce,
    gasLimit: 100000,
    gasPrice: eip1559Fees.gasPrice,
    maxFeePerGas: eip1559Fees.maxFeePerGas,
    maxPriorityFeePerGas: eip1559Fees.maxPriorityFeePerGas,
  });
}
