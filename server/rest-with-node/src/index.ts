import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_REST_BASE_URL = process.env.PARA_REST_BASE_URL ?? 'https://api.sandbox.getpara.com';
const PARA_POLL_INTERVAL_MS = Number(process.env.PARA_POLL_INTERVAL_MS ?? 2000);
const PARA_POLL_TIMEOUT_MS = Number(process.env.PARA_POLL_TIMEOUT_MS ?? 20000);

if (!PARA_API_KEY) {
  console.warn('⚠️  PARA_API_KEY is not set. Requests to Para will fail until you add it to .env');
}

type WalletType = 'EVM' | 'SOLANA' | 'COSMOS';
type WalletStatus = 'creating' | 'ready' | 'error';

type Wallet = {
  id: string;
  type: WalletType;
  status: WalletStatus;
  address?: string;
  publicKey?: string;
  createdAt: string;
};

type WalletResponse = {
  wallet: Wallet;
  scheme: 'DKLS' | 'CGGMP' | 'ED25519';
};

type SignRawResponse = {
  signature: string;
};

type CreateWalletBody = {
  type: WalletType;
  userIdentifier: string;
  userIdentifierType: string;
  scheme?: WalletResponse['scheme'];
  cosmosPrefix?: string;
};

type SignBody = {
  data: string;
};

const WALLET_STATUSES: WalletStatus[] = ['creating', 'ready', 'error'];

class ParaError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type ParaRequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

function isWallet(candidate: unknown): candidate is Wallet {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const wallet = candidate as Partial<Wallet>;
  return (
    typeof wallet.id === 'string' &&
    typeof wallet.type === 'string' &&
    (WALLET_STATUSES as string[]).includes(wallet.status as string) &&
    typeof wallet.createdAt === 'string'
  );
}

function extractWallet(payload: unknown, context: string): { wallet: Wallet; scheme?: WalletResponse['scheme'] } {
  if (payload && typeof payload === 'object') {
    const maybeWrapped = payload as { wallet?: Wallet; scheme?: WalletResponse['scheme'] };
    if (maybeWrapped.wallet && isWallet(maybeWrapped.wallet)) {
      return { wallet: maybeWrapped.wallet, scheme: maybeWrapped.scheme };
    }
  }

  if (isWallet(payload)) {
    return { wallet: payload };
  }

  console.error(`[${context}] Unexpected Para response shape`, payload);
  throw new Error(`Para ${context} response was missing a wallet. Check server logs for the raw body.`);
}

async function callPara<T>(path: string, options: ParaRequestOptions = {}): Promise<T> {
  if (!PARA_API_KEY) {
    throw new Error('Set PARA_API_KEY in your .env first.');
  }

  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {
    'X-API-Key': PARA_API_KEY,
    'X-Request-Id': randomUUID(),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${PARA_REST_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let parsed: unknown = undefined;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new ParaError('Para returned a non-JSON response', response.status, raw);
    }
  }

  if (!response.ok) {
    throw new ParaError(
      `Para REST responded with ${response.status}`,
      response.status,
      parsed ?? { message: raw || 'Unknown error' },
    );
  }

  return (parsed as T) ?? ({} as T);
}

async function waitUntilWalletReady(walletId: string): Promise<Wallet> {
  const startedAt = Date.now();
  let lastPayload: unknown = undefined;

  while (Date.now() - startedAt < PARA_POLL_TIMEOUT_MS) {
    const pollResponse = await callPara<Wallet>(`/v1/wallets/${walletId}`);
    lastPayload = pollResponse;
    const { wallet } = extractWallet(pollResponse, 'poll wallet');

    if (wallet.status === 'error') {
      console.error('[waitUntilWalletReady] Wallet entered error status while polling', { walletId, wallet });
      throw new Error(`Wallet ${walletId} reported status "error" while polling`);
    }
    if (wallet.status === 'ready') {
      return wallet;
    }

    await new Promise((resolve) => setTimeout(resolve, PARA_POLL_INTERVAL_MS));
  }

  console.error('[waitUntilWalletReady] Timed out waiting for wallet', { walletId, lastPayload });
  throw new Error(`Timed out waiting for wallet ${walletId} to become ready`);
}

function handleError(res: Response, error: unknown): Response {
  if (error instanceof ParaError) {
    return res.status(error.status).json({ error: error.message, details: error.body });
  }

  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Unknown error' });
}

app.get('/', (_req, res) => {
  res.json({
    message: 'Para REST example is running. Use POST /rest/example-flow to see the full create + sign flow.',
  });
});

app.post('/rest/wallets', async (req: Request<unknown, unknown, CreateWalletBody>, res: Response) => {
  const { type, userIdentifier, userIdentifierType, scheme, cosmosPrefix } = req.body;

  if (!type || !userIdentifier || !userIdentifierType) {
    return res.status(400).json({ error: 'type, userIdentifier, and userIdentifierType are required' });
  }

  try {
    const creation = await callPara<WalletResponse | Wallet>('/v1/wallets', {
      method: 'POST',
      body: {
        type,
        userIdentifier,
        userIdentifierType,
        scheme,
        cosmosPrefix,
      },
    });

    const { wallet, scheme: returnedScheme } = extractWallet(creation, 'create wallet');

    res.status(201).json({
      wallet,
      scheme: returnedScheme,
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/rest/wallets/:walletId', async (req: Request, res: Response) => {
  try {
    const walletResponse = await callPara<Wallet>(`/v1/wallets/${req.params.walletId}`);
    const { wallet } = extractWallet(walletResponse, 'get wallet');
    res.json(wallet);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/rest/wallets/:walletId/sign-raw', async (
  req: Request<{ walletId: string }, unknown, SignBody>,
  res: Response,
) => {
  const { walletId } = req.params;
  const { data } = req.body;

  if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
    return res.status(400).json({ error: 'data must be a 0x-prefixed hex string' });
  }

  try {
    const response = await callPara<SignRawResponse>(`/v1/wallets/${walletId}/sign-raw`, {
      method: 'POST',
      body: { data },
    });

    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/rest/example-flow', async (
  req: Request<unknown, unknown, CreateWalletBody & { dataToSign?: string }>,
  res: Response,
) => {
  const { type = 'EVM', userIdentifier, userIdentifierType = 'EMAIL', scheme, cosmosPrefix, dataToSign = '0xdeadbeef' } =
    req.body;

  if (!userIdentifier) {
    return res.status(400).json({ error: 'userIdentifier is required for the example flow' });
  }

  if (!dataToSign.startsWith('0x')) {
    return res.status(400).json({ error: 'dataToSign must start with 0x' });
  }

  try {
    const creation = await callPara<WalletResponse | Wallet>('/v1/wallets', {
      method: 'POST',
      body: { type, userIdentifier, userIdentifierType, scheme, cosmosPrefix },
    });

    console.log('[example-flow] create response from Para', creation);

    const { wallet: createdWallet, scheme: creationScheme } = extractWallet(creation, 'create wallet');

    const walletReady =
      createdWallet.status === 'ready' ? createdWallet : await waitUntilWalletReady(createdWallet.id);

    const signed = await callPara<SignRawResponse>(`/v1/wallets/${walletReady.id}/sign-raw`, {
      method: 'POST',
      body: { data: dataToSign },
    });

    if (!signed || typeof signed.signature !== 'string') {
      console.error('[example-flow] Unexpected sign-raw response', signed);
      throw new Error('Para sign-raw response did not include a signature');
    }

    res.json({
      walletId: walletReady.id,
      address: walletReady.address,
      status: walletReady.status,
      signature: signed.signature,
      scheme: creationScheme,
    });
  } catch (error) {
    if (error instanceof ParaError && error.status === 409) {
      return res.status(409).json({
        error: 'A wallet for this identifier and type already exists.',
        details: error.body,
      });
    }

    handleError(res, error);
  }
});

app.listen(PORT, () => {
  console.log(`Para REST example listening on http://localhost:${PORT}`);
  console.log('Hit POST /rest/example-flow to run the end-to-end demo.');
});
