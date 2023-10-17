import { AccountData, AminoSignResponse, encodeSecp256k1Signature, OfflineAminoSigner, rawSecp256k1PubkeyToRawAddress, serializeSignDoc, StdSignDoc } from '@cosmjs/amino';
import { toBech32 } from '@cosmjs/encoding';
import { Secp256k1, Sha256, sha256, ExtendedSecp256k1Signature } from '@cosmjs/crypto';
import { OfflineDirectSigner, makeSignBytes, DirectSignResponse } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { Capsule } from '../../Capsule';
import { SuccessfulSignatureRes } from '../../core/types';
import { hexToSignature, hexToUint8Array } from '../../utils/formattingUtils';
import { CoreCapsule } from '../../core/CoreCapsule';

class CapsuleCosmosSigner {
  readonly prefix: string;
  readonly capsule: Capsule | CoreCapsule;
  private _currentWalletId?: string;

  constructor(capsule: Capsule | CoreCapsule, prefix = 'cosmos', currentWalletId?: string) {
    this.capsule = capsule;
    this.prefix = prefix;
    this._currentWalletId = currentWalletId;
  }

  get publicKey(): Uint8Array {
    const wallet = this.capsule.getWallets()[this.currentWalletId];
    const uncompressedPublicKey = hexToUint8Array(wallet.publicKey);
    const compressedPublicKey = Secp256k1.compressPubkey(uncompressedPublicKey);
    return compressedPublicKey;
  }

  set currentWalletId(walletId: string) {
    this._currentWalletId = walletId;
  }

  get currentWalletId(): string {
    return this._currentWalletId || Object.values(this.capsule.getWallets())[0]?.id;
  }

  get address(): string {
    return toBech32(this.prefix, rawSecp256k1PubkeyToRawAddress(this.publicKey));
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

    const res = await this.capsule.signMessage(this.currentWalletId, Buffer.from(hashedMessage.buffer).toString('base64'));
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

    const res = await this.capsule.signMessage(this.currentWalletId, Buffer.from(hashedMessage.buffer).toString('base64'));
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
