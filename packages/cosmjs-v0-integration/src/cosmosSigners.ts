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

import ParaCore, {
  SuccessfulSignatureRes,
  hexToSignature,
  hexToUint8Array,
  Wallet,
  getCosmosAddress,
} from '@getpara/core-sdk';

class ParaCosmosSigner {
  readonly prefix: string;
  readonly para: ParaCore;
  readonly currentWalletId: string;
  readonly messageSigningTimeoutMs?: number;

  /**
   * Signs a message.
   *
   * @param para - the ParaCore instance
   * @param prefix - the cosmos address prefix, defaults to 'cosmos'
   * @param walletId - optional wallet ID to use. If not present, will use the first wallet found.
   * @param messageSigningTimeoutMs - optional timeout in milliseconds. If not present, defaults to 30 seconds.
   **/
  constructor(para: ParaCore, prefix = 'cosmos', walletId?: string, messageSigningTimeoutMs?: number) {
    this.currentWalletId = para.findWalletId(walletId, { type: ['COSMOS'] });
    this.para = para;
    this.prefix = prefix;
    this.messageSigningTimeoutMs = messageSigningTimeoutMs;
  }

  get currentWallet(): Wallet {
    return (
      this.para.wallets[this.currentWalletId] ??
      (() => {
        throw new Error(`no valid Para wallet found`);
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

export class ParaProtoSigner extends ParaCosmosSigner implements OfflineDirectSigner {
  async signDirect(address: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const signBytes = makeSignBytes(signDoc);
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const hashedMessage = sha256(signBytes);
    const signDocJson = SignDoc.toJSON(signDoc);
    const signDocJsonStringified = JSON.stringify(signDocJson);
    const signDocJsonStringEncoded = btoa(signDocJsonStringified);

    const res = await this.para.signMessage({
      walletId: this.currentWallet.id,
      messageBase64: Buffer.from(hashedMessage.buffer).toString('base64'),
      timeoutMs: this.messageSigningTimeoutMs,
      cosmosSignDocBase64: signDocJsonStringEncoded,
    });
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

export class ParaAminoSigner extends ParaCosmosSigner implements OfflineAminoSigner {
  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    if (signerAddress !== this.address) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const hashedMessage = new Sha256(serializeSignDoc(signDoc)).digest();

    const res = await this.para.signMessage({
      walletId: this.currentWallet.id,
      messageBase64: Buffer.from(hashedMessage.buffer).toString('base64'),
    });
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
