import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data';
import { getChainData } from '@/data/chainsUtil';
import CapsuleLib from '@/lib/CapsuleLib';
import { getSignParamsMessage, getSignTypedDataParamsData } from '@/utils/HelperUtil';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { COSMOS_SIGNING_METHODS } from '@/data/COSMOSData';

type RequestEventArgs = Omit<SignClientTypes.EventArguments['session_request'], 'verifyContext'>;
export async function approveRequest(requestEvent: RequestEventArgs, walletId?: string) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const wallet = await CapsuleLib.init();

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {
        const message = getSignParamsMessage(request.params);
        const signedMessage = await wallet.signMessage(message, walletId);
        return formatJsonRpcResult(id, signedMessage);
      } catch (error: any) {
        console.error('error', error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      try {
        const { domain, types, message: data } = getSignTypedDataParamsData(request.params);
        // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
        delete types.EIP712Domain;
        const signedData = await wallet._signTypedData(domain, types, data, walletId);
        return formatJsonRpcResult(id, signedData);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const signTransaction = request.params[0];
        const signature = await wallet.signTransaction(signTransaction, walletId);
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        const sendTransaction = request.params[0];
        const chain = getChainData(chainId);
        const { hash } = await wallet.sendTransaction(sendTransaction, chain?.rpc, Number(chain?.chainId), walletId);
        return formatJsonRpcResult(id, hash);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }
    case EIP155_SIGNING_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN: {
      return formatJsonRpcResult(id, {});
    }

    case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
      try {
        const signedDirect = await wallet.signDirect(request.params.signerAddress, request.params.signDoc, walletId);
        const signature = signedDirect.signature;
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
      try {
        const signedAmino = await wallet.signAmino(request.params.signerAddress, request.params.signDoc, walletId);
        const signature = signedAmino.signature;
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }
    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectRequest(request: RequestEventArgs) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}

export async function approveAuthRequest(message: string, walletId?: string) {
  const wallet = await CapsuleLib.init();
  const signedMessage = await wallet.signMessage(message, walletId);
  return signedMessage;
}
