import express, { Express, NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as uuid from 'uuid';
import * as ethers from 'ethers';
import { sepolia } from 'viem/chains';
import { http } from 'viem'
import { PublicKeyStatus } from '@usecapsule/user-management-client';

import CapsuleServer, {
  CapsuleEthersSigner,
  Environment,
  createCapsuleViemClient,
} from './library'; // '@usecapsule/server-sdk';
const app: Express = express();
const port = process.env.PORT || '7007';

const SAMPLE_PUBLIC_KEY = 'eUKd9DtPMTW6FIz_1LHYWBp-eJE';
const SAMPLE_SIG_DERIVED_PUBLIC_KEY = '2d2d2d2d2d424547494e20525341205055424c4943204b45592d2d2d2d2d0d0a4d49494243674b43415145416a627a5049484838462b45516a674a524f747473656e6575367373426f61726a4b5153445279436c442b646b524e72676f6c68690d0a586651333350467066614e6c51356b68454c6f754d354543434c77527873575061666273794a366f7a33617368487353505a4c6f5571302b55792b534b3533700d0a6842325a7a366d556537682b76392b595978326c7355636c55696958753231444b3946474a6b2f4e3730386537706b4a5a4c59705935444e756442414c6548540d0a6f6476716c476a4d7449566f7336437a6b5168306e572f31314b5243433062697a52476f50566a5667644a6d32345931685064696e6a4135546b70695675467a0d0a38752f41564335566f6d71345562786f656348774c377a4d54364f75476b753843583478456e7a65356d4d6a74465062523668657652486d69522f565032657a0d0a766d39444d79344f4c5a5462474a4a466d49626c47564d7461727a737959767266774944415141420d0a2d2d2d2d2d454e4420525341205055424c4943204b45592d2d2d2d2d0d0a';
const SAMPLE_COSE_PUBLIC_KEY = 'BIhJlucXJbHVMhEzZ49cGPAQIHeinFXlQvV-Ku4WNeL1By0H-TEjUwpZyjEZGFphcqkbya5bbOs4KYzSJDHFrro';
const SAMPLE_CLIENT_DATA_JSON = 'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWlRSak4yTTNObVV0TURneFlpMDBaak01TFRnek9HVXRZV1k0WlRoak56a3lNakptIiwib3JpZ2luIjoiaHR0cHM6Ly9hcHAuc2FuZGJveC51c2VjYXBzdWxlLmNvbSJ9';
const ALCHEMY_SEPOLIA_PROVIDER = 'https://eth-sepolia.g.alchemy.com/v2/KfxK8ZFXw9mTUuJ7jt751xGJCa3r8noZ';

interface Params {
  email?: string;
}

const capsule = new CapsuleServer(Environment.SANDBOX);

async function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): Promise<void> {
  console.error(err);
  res.sendStatus(500);
}

async function createUserAndWallet(params: Params) {
  const { email } = params;
  await capsule.createUser(email || `server-test${uuid.v4()}@test.usecapsule.com`);
  const webAuthURL = await capsule.verifyEmail('123456');
  // the steps between the `~~~~~~~` will happen in the portal and don't need to be manually performed
  // ~~~~~~~
  // @ts-ignore
  const userId = capsule.userId;
  const biometricIdRegex = /\/biometrics\/(.*?)\?email/;
  const biometricId = webAuthURL.match(biometricIdRegex)[1]; 
  await capsule.ctx.capsuleClient.patchSessionPublicKey(userId, biometricId, {
    publicKey: SAMPLE_PUBLIC_KEY,
    sigDerivedPublicKey: SAMPLE_SIG_DERIVED_PUBLIC_KEY,
    cosePublicKey: SAMPLE_COSE_PUBLIC_KEY,
    clientDataJSON: SAMPLE_CLIENT_DATA_JSON,
    status: PublicKeyStatus.COMPLETE,
  });
  // ~~~~~~~
  await capsule.createWallet(false, () => {});
  // @ts-ignore
  const walletAddress = Object.values(capsule.getWallets())[0].address;
  console.log(`address: ${walletAddress}`)

  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia')
  const ethersSigner = new CapsuleEthersSigner(capsule, provider);
  const viemClient = createCapsuleViemClient(capsule, {
    chain: sepolia,
    transport: http(ALCHEMY_SEPOLIA_PROVIDER),
  });
  console.log(await ethersSigner.signMessage('hello-world'));
  console.log(await ethersSigner.signMessage('hello-world2'));
  console.log(await viemClient.signMessage({
    message: 'hello-world3',
    account: viemClient.account,
  }));
}

async function signMessageWithImport(serializedInstance: string): Promise<void> {
  console.log('importing session');
  capsule.importSession(serializedInstance);
  // @ts-ignore
  console.log(`address: ${Object.values(capsule.getWallets())[0].address}`)
  
  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia')
  const ethersSigner = new CapsuleEthersSigner(capsule, provider);
  const viemClient = createCapsuleViemClient(capsule, {
    chain: sepolia,
    transport: http(ALCHEMY_SEPOLIA_PROVIDER),
  });
  console.log(await ethersSigner.signMessage('hello-world'));
  console.log(await ethersSigner.signMessage('hello-world2'));
  console.log(await viemClient.signMessage({
    message: 'hello-world3'
  } as any));
}

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
  res.send('200');
});

app.post('/wallets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, serializedInstance } = req.body;
    if (serializedInstance) {
      await signMessageWithImport(serializedInstance);
    } else {
      await createUserAndWallet({ email });
    }
    res.send('200');
  } catch (e) {
    next(e);
  }
});

app.post('/sign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia')
    const ethersSigner = new CapsuleEthersSigner(capsule, provider);
    const viemClient = createCapsuleViemClient(capsule, {
      chain: sepolia,
      transport: http(ALCHEMY_SEPOLIA_PROVIDER),
    });

    console.log(await ethersSigner.signMessage(message));
    console.log(await viemClient.signMessage({
      message,
      account: viemClient.account,
    }));
    res.send('200');
  } catch (e) {
    next(e);
  }
});

app.use(errorMiddleware);

app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
});
