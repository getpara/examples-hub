import { ethers } from 'ethers';
import { StdSignDoc } from '@cosmjs/amino';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

/**
 * Library
 */
export default class CapsuleLib {
  static capsule: any;

  static async loadCapsule() {
    if (!this.capsule) {
      const CapsuleModule = (await import('@getpara/react-sdk')).ParaWeb;
      this.capsule = new CapsuleModule(process.env.NEXT_PUBLIC_API_KEY ?? '');
    }
    return this.capsule;
  }

  static async init() {
    await this.loadCapsule();
    return new CapsuleLib();
  }

  async getAddress() {
    await CapsuleLib.loadCapsule();
    return CapsuleLib.capsule.getWallets()?.[Object.keys(CapsuleLib.capsule.getWallets())[0]]?.address;
  }

  async signMessage(message: string, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const EthersSigner = (await import('@getpara/ethers-v6-integration')).ParaEthersSigner;
    const signer = new EthersSigner(CapsuleLib.capsule, undefined, walletId);
    const response = await signer.signMessage(message);
    return response;
  }

  async signTransaction(tx: any, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const EthersSigner = (await import('@getpara/ethers-v6-integration')).ParaEthersSigner;
    const signer = new EthersSigner(CapsuleLib.capsule, undefined, walletId);
    const response = await signer.signTransaction(tx);
    return response;
  }

  async sendTransaction(tx: any, rpcUrl: string | undefined, network: number | undefined, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const provider: any = new ethers.JsonRpcProvider(rpcUrl, network);
    const EthersSigner = (await import('@getpara/ethers-v6-integration')).ParaEthersSigner;
    const signer = new EthersSigner(CapsuleLib.capsule, provider, walletId);

    const response = await signer.sendTransaction(tx);
    return response;
  }

  async _signTypedData(domain: any, types: any, data: any, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const EthersSigner = (await import('@getpara/ethers-v6-integration')).ParaEthersSigner;
    const signer = new EthersSigner(CapsuleLib.capsule, undefined, walletId);

    const response = await signer.signTypedData(domain, types, data);
    return response;
  }

  async signDirect(address: string, signDoc: SignDoc, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const CosmosSigner = (await import('@getpara/cosmjs-v0-integration')).ParaProtoSigner;
    const signer: any = new CosmosSigner(CapsuleLib.capsule, undefined, walletId);
    // const client = await SigningStargateClient.connectWithSigner('rpc.sentry-01.theta-testnet.polypore.xyz', signer)
    // console.log(await client.getAccount(address));
    // console.log(await client.getAllBalances(address))
    const response = await signer.signDirect(address, signDoc);
    return response;
  }

  async signAmino(address: string, signDoc: StdSignDoc, walletId?: string) {
    await CapsuleLib.loadCapsule();
    const CosmosSigner = (await import('@getpara/cosmjs-v0-integration')).ParaAminoSigner;
    const signer = new CosmosSigner(CapsuleLib.capsule, undefined, walletId);
    const response = await signer.signAmino(address, signDoc);
    return response;
  }
}
