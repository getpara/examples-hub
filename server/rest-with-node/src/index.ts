import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_REST_BASE_URL = process.env.PARA_REST_BASE_URL ?? 'https://api.beta.getpara.com';

if (!PARA_API_KEY) {
  console.warn('PARA_API_KEY is not set. Requests to Para will fail until you add it to .env');
}

type WalletType = 'EVM' | 'SOLANA' | 'COSMOS';

type WalletScheme = 'DKLS' | 'CGGMP' | 'ED25519';

type Wallet = {
  id: string;
  type: WalletType;
  scheme: WalletScheme;
  status: 'creating' | 'ready' | 'error';
  address?: string;
  publicKey?: string;
  createdAt: string;
};

type CreateWalletBody = {
  type: WalletType;
  userIdentifier: string;
  userIdentifierType: string;
  scheme?: WalletScheme;
  cosmosPrefix?: string;
};

class ParaError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
  }
}

async function callPara<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown } = {}): Promise<T> {
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

  const text = await response.text();
  let parsed: unknown = {};

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ParaError('Para returned invalid JSON', response.status, text);
    }
  }

  if (!response.ok) {
    throw new ParaError(`Para responded with ${response.status}`, response.status, parsed);
  }

  return parsed as T;
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof ParaError) {
    res.status(error.status).json({ error: error.message, details: error.body });
    return;
  }
  res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
}

app.get('/', (_req, res) => {
  res.json({ message: 'Para REST example is running. See README for usage.' });
});

app.post('/rest/wallets', async (req: Request<unknown, unknown, CreateWalletBody>, res: Response) => {
  const { type, userIdentifier, userIdentifierType, scheme, cosmosPrefix } = req.body;

  if (!type || !userIdentifier || !userIdentifierType) {
    return res.status(400).json({ error: 'type, userIdentifier, and userIdentifierType are required' });
  }

  try {
    const wallet = await callPara<Wallet>('/v1/wallets', {
      method: 'POST',
      body: { type, userIdentifier, userIdentifierType, scheme, cosmosPrefix },
    });
    res.status(201).json(wallet);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/rest/wallets', async (req: Request, res: Response) => {
  const params = new URLSearchParams();
  for (const key of ['userIdentifier', 'userIdentifierType', 'type', 'status', 'address', 'limit', 'cursor']) {
    if (req.query[key] != null) params.set(key, String(req.query[key]));
  }

  try {
    const qs = params.toString();
    const result = await callPara<{ data: Wallet[]; pagination: { cursor: string | null; hasMore: boolean; limit: number } }>(
      `/v1/wallets${qs ? `?${qs}` : ''}`,
    );
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/rest/wallets/:walletId', async (req: Request, res: Response) => {
  try {
    const wallet = await callPara<Wallet>(`/v1/wallets/${req.params.walletId}`);
    res.json(wallet);
  } catch (error) {
    handleError(res, error);
  }
});

app.patch('/rest/wallets/:walletId', async (req: Request<{ walletId: string }>, res: Response) => {
  const { userIdentifier, userIdentifierType } = req.body;

  if (!userIdentifier || !userIdentifierType) {
    return res.status(400).json({ error: 'userIdentifier and userIdentifierType are required' });
  }

  try {
    const wallet = await callPara<Wallet>(`/v1/wallets/${req.params.walletId}`, {
      method: 'PATCH',
      body: { userIdentifier, userIdentifierType },
    });
    res.json(wallet);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/rest/wallets/:walletId/sign-raw', async (req: Request<{ walletId: string }>, res: Response) => {
  const { data } = req.body;

  if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
    return res.status(400).json({ error: 'data must be a 0x-prefixed hex string' });
  }

  try {
    const result = await callPara<{ signature: string }>(`/v1/wallets/${req.params.walletId}/sign-raw`, {
      method: 'POST',
      body: { data },
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

app.post(
  '/rest/wallets/:walletId/sign-transaction',
  async (req: Request<{ walletId: string }>, res: Response) => {
    const { transaction } = req.body;

    if (!transaction || typeof transaction !== 'object' || Array.isArray(transaction)) {
      return res.status(400).json({ error: 'transaction object is required' });
    }

    if (!transaction.to || !transaction.chainId) {
      return res.status(400).json({ error: 'transaction.to and transaction.chainId are required' });
    }

    try {
      const result = await callPara<{ signedTransaction: string }>(
        `/v1/wallets/${req.params.walletId}/sign-transaction`,
        { method: 'POST', body: { transaction } },
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  },
);

app.listen(PORT, () => {
  console.log(`Para REST example listening on http://localhost:${PORT}`);
});
