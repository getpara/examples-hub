import {
  AccountData,
  AminoSignResponse,
  encodeSecp256k1Signature,
  OfflineAminoSigner,
  serializeSignDoc,
  StdSignDoc,
} from '@cosmjs/amino';
import { Secp256k1, Sha256, sha256, ExtendedSecp256k1Signature } from '@cosmjs/crypto';
import { OfflineDirectSigner, makeSignBytes, DirectSignResponse } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import CoreCapsule, {
  SuccessfulSignatureRes,
  hexToSignature,
  hexToUint8Array,
  Wallet,
  getCosmosAddress,
} from '@usecapsule/core-sdk';

class CapsuleCosmosSigner {
  readonly prefix: string;
  readonly capsule: CoreCapsule;
  readonly currentWalletId: string;

  constructor(capsule: CoreCapsule, prefix = 'cosmos', walletId?: string) {
    this.currentWalletId = capsule.findWalletId(walletId, { type: ['COSMOS'] });
    this.capsule = capsule;
    this.prefix = prefix;
  }

  get currentWallet(): Wallet {
    return (
      this.capsule.wallets[this.currentWalletId] ??
      (() => {
        throw new Error(`no valid Capsule wallet found`);
      })()
    );
  }

  get publicKey(): Uint8Array {
    const uncompressedPublicKey = hexToUint8Array(this.currentWallet.publicKey);
    const compressedPublicKey = Secp256k1.compressPubkey(uncompressedPublicKey);
    return compressedPublicKey;
  }

  get address(): string {
    return getCosmosAddress(this.currentWallet.publicKey, this.prefix);
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: 'secp256k1',
        address: this.address,
        pubkey: this.publicKey,
      },
    ];
  }
}

export class CapsuleProtoSigner extends CapsuleCosmosSigner implements OfflineDirectSigner {
  async signDirect(address: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const signBytes = makeSignBytes(signDoc);
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const hashedMessage = sha256(signBytes);

    const res = await this.capsule.signMessage(this.currentWallet.id, Buffer.from(hashedMessage.buffer).toString('base64'));
    const signature = hexToSignature(`0x${(res as SuccessfulSignatureRes).signature}`);
    const extendedSignature = new ExtendedSecp256k1Signature(
      hexToUint8Array(signature.r),
      hexToUint8Array(signature.s),
      Number(signature.v),
    );
    const signatureBytes = new Uint8Array([...extendedSignature.r(32), ...extendedSignature.s(32)]);

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.publicKey, signatureBytes),
    };
  }
}

export class CapsuleAminoSigner extends CapsuleCosmosSigner implements OfflineAminoSigner {
  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    if (signerAddress !== this.address) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const hashedMessage = new Sha256(serializeSignDoc(signDoc)).digest();

    const res = await this.capsule.signMessage(this.currentWallet.id, Buffer.from(hashedMessage.buffer).toString('base64'));
    const signature = hexToSignature(`0x${(res as SuccessfulSignatureRes).signature}`);
    const extendedSignature = new ExtendedSecp256k1Signature(
      hexToUint8Array(signature.r),
      hexToUint8Array(signature.s),
      Number(signature.v),
    );
    const signatureBytes = new Uint8Array([...extendedSignature.r(32), ...extendedSignature.s(32)]);

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.publicKey, signatureBytes),
    };
  }
}
