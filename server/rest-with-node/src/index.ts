import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(express.json({ limit: '100kb' }));

const PORT = Number(process.env.PORT ?? 4000);
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_REST_BASE_URL = process.env.PARA_REST_BASE_URL ?? 'https://api.beta.getpara.com';

// Secret API key for /sessions/verify — different from PARA_API_KEY.
// https://docs.getpara.com/v2/server/guides/sessions#session-validation
const PARA_SECRET_API_KEY = process.env.PARA_SECRET_API_KEY;
const PARA_SESSION_VERIFY_URL =
  process.env.PARA_SESSION_VERIFY_URL ?? 'https://api.beta.getpara.com/sessions/verify';

if (!PARA_API_KEY) {
  console.warn('PARA_API_KEY is not set. Requests to Para will fail until you add it to .env');
}
if (!PARA_SECRET_API_KEY) {
  console.warn('PARA_SECRET_API_KEY is not set — wallet-scoped routes will reject all requests.');
}

type WalletType = 'EVM' | 'SOLANA' | 'COSMOS' | 'STELLAR';

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
    console.error('Para error', error.status, error.body);
    res.status(502).json({ error: 'Upstream provider error' });
    return;
  }
  console.error('Unexpected error', error);
  res.status(500).json({ error: 'Internal server error' });
}

// Routes rejections and sync throws to Express's error handler.
function asyncHandler<P, ResBody, ReqBody, ReqQuery>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void> | void,
) {
  return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };
}

type ParaSessionUserData = {
  identifier: string;
  authType?: string;
  oAuthMethod?: string;
};

async function verifyParaSession(verificationToken: string): Promise<ParaSessionUserData | null> {
  if (!PARA_SECRET_API_KEY) return null;

  const response = await fetch(PARA_SESSION_VERIFY_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-external-api-key': PARA_SECRET_API_KEY,
    },
    body: JSON.stringify({ verificationToken }),
  });

  if (response.status === 403) return null; // expired/invalid session
  if (!response.ok) return null;

  const userData = (await response.json()) as ParaSessionUserData;
  if (!userData?.identifier) return null;
  return userData;
}

// Maps /sessions/verify's authType/oAuthMethod to the userIdentifierType enum
// used by /v1/wallets (EMAIL | PHONE | CUSTOM_ID | GUEST_ID | TELEGRAM |
// DISCORD | TWITTER | FARCASTER). Returns null for anything with no wallet
// equivalent (e.g. externalWallet, unmapped OAuth providers) — better to
// reject the session explicitly than to guess and get a confusing 403 later.
function toUserIdentifierType(userData: ParaSessionUserData): string | null {
  switch ((userData.authType ?? '').toLowerCase()) {
    case 'email':
      return 'EMAIL';
    case 'phone':
      return 'PHONE';
    case 'telegram':
      return 'TELEGRAM';
    case 'farcaster':
      return 'FARCASTER';
    case 'oauth':
      switch ((userData.oAuthMethod ?? '').toLowerCase()) {
        case 'discord':
          return 'DISCORD';
        case 'twitter':
        case 'x':
          return 'TWITTER';
        default:
          return null;
      }
    default:
      return null;
  }
}

type CallerIdentity = { userIdentifier: string; userIdentifierType: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: CallerIdentity;
    }
  }
}

const requireSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Missing or malformed Authorization: Bearer <verificationToken> header' });
    return;
  }

  const userData = await verifyParaSession(token);
  if (!userData) {
    res.status(401).json({ error: 'Invalid or expired Para session' });
    return;
  }

  const userIdentifierType = toUserIdentifierType(userData);
  if (!userIdentifierType) {
    res.status(401).json({ error: 'This login method is not supported for wallet operations' });
    return;
  }

  req.auth = { userIdentifier: userData.identifier, userIdentifierType };
  next();
});

// No TTL/invalidation — a revoked access won't clear until restart. Swap for
// a real DB with proper invalidation in production.
const walletOwnerCache = new Map<string, { userIdentifier: string; userIdentifierType: string }>();

async function walletBelongsToCaller(
  walletId: string,
  caller: { userIdentifier: string; userIdentifierType: string },
): Promise<boolean> {
  const cached = walletOwnerCache.get(walletId);
  if (cached) {
    return cached.userIdentifier === caller.userIdentifier && cached.userIdentifierType === caller.userIdentifierType;
  }

  // Cross-check with Para directly rather than trusting the claim.
  // NB: only checks the first page — add cursor handling if your account is
  // on an API version where /v1/wallets paginates.
  const result = await callPara<{ data: Wallet[] }>(
    `/v1/wallets?userIdentifier=${encodeURIComponent(caller.userIdentifier)}&userIdentifierType=${encodeURIComponent(
      caller.userIdentifierType,
    )}`,
  );

  const owns = result.data.some((wallet) => wallet.id === walletId);
  if (owns) {
    walletOwnerCache.set(walletId, caller);
  }
  return owns;
}

function requireWalletOwnership(paramName = 'walletId') {
  return asyncHandler(async (req: Request<Record<string, string>>, res: Response, next: NextFunction) => {
    if (!req.auth) {
      // Should not happen if requireSession ran first, but keep this safe.
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const walletId = req.params[paramName];
    const owns = await walletBelongsToCaller(walletId, req.auth);
    if (!owns) {
      res.status(403).json({ error: 'You do not have access to this wallet' });
      return;
    }

    next();
  });
}

app.get('/', (_req, res) => {
  res.json({ message: 'Para REST example is running. See README for usage.' });
});

app.post(
  '/rest/wallets',
  requireSession,
  asyncHandler(async (req: Request<unknown, unknown, CreateWalletBody>, res: Response) => {
    const { type, scheme, cosmosPrefix } = req.body;
    // Owner = authenticated caller, not the body.
    const { userIdentifier, userIdentifierType } = req.auth!;

    if (!type) {
      res.status(400).json({ error: 'type is required' });
      return;
    }

    try {
      const wallet = await callPara<Wallet>('/v1/wallets', {
        method: 'POST',
        body: { type, userIdentifier, userIdentifierType, scheme, cosmosPrefix },
      });
      walletOwnerCache.set(wallet.id, { userIdentifier, userIdentifierType });
      res.status(201).json(wallet);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.get(
  '/rest/wallets',
  requireSession,
  asyncHandler(async (req: Request, res: Response) => {
    // Ignore any userIdentifier query param — list only the caller's own.
    const { userIdentifier, userIdentifierType } = req.auth!;

    try {
      const result = await callPara<{ data: Wallet[] }>(
        `/v1/wallets?userIdentifier=${encodeURIComponent(userIdentifier)}&userIdentifierType=${encodeURIComponent(
          userIdentifierType,
        )}`,
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.get(
  '/rest/wallets/:walletId',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const wallet = await callPara<Wallet>(`/v1/wallets/${encodeURIComponent(req.params.walletId)}`);
      res.json(wallet);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.patch(
  '/rest/wallets/:walletId',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request<{ walletId: string }>, res: Response) => {
    // Scoped to the caller's own identity — can't reassign to someone else.
    const { userIdentifier, userIdentifierType } = req.auth!;

    try {
      const wallet = await callPara<Wallet>(`/v1/wallets/${encodeURIComponent(req.params.walletId)}`, {
        method: 'PATCH',
        body: { userIdentifier, userIdentifierType },
      });
      res.json(wallet);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.post(
  '/rest/wallets/:walletId/sign-raw',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request<{ walletId: string }>, res: Response) => {
    const { data } = req.body;

    if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
      res.status(400).json({ error: 'data must be a 0x-prefixed hex string' });
      return;
    }

    try {
      const result = await callPara<{ signature: string }>(
        `/v1/wallets/${encodeURIComponent(req.params.walletId)}/sign-raw`,
        { method: 'POST', body: { data } },
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.post(
  '/rest/wallets/:walletId/sign-transaction',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request<{ walletId: string }>, res: Response) => {
    const { transaction } = req.body;

    // EVM: transaction is an object with { to, chainId, ... }.
    // Solana: transaction is a base64-encoded string. Both legacy `Transaction` and
    // v0 `VersionedTransaction` (with Address Lookup Tables) are accepted — the REST
    // API auto-detects the format.
    const isEvm = transaction && typeof transaction === 'object' && !Array.isArray(transaction);
    const isSolana = typeof transaction === 'string' && transaction.length > 0;

    if (!isEvm && !isSolana) {
      res.status(400).json({
        error:
          'transaction must be an EVM object ({ to, chainId, ... }) or a base64-encoded Solana transaction string',
      });
      return;
    }

    if (isEvm && (!transaction.to || !transaction.chainId)) {
      res.status(400).json({ error: 'EVM transaction.to and transaction.chainId are required' });
      return;
    }

    try {
      const result = await callPara<{ signedTransaction: string }>(
        `/v1/wallets/${encodeURIComponent(req.params.walletId)}/sign-transaction`,
        { method: 'POST', body: { transaction } },
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.post(
  '/rest/wallets/:walletId/sign-typed-data',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request<{ walletId: string }>, res: Response) => {
    const { typedData } = req.body;

    if (!typedData || typeof typedData !== 'object') {
      res.status(400).json({ error: 'typedData object is required' });
      return;
    }

    if (!typedData.domain || !typedData.types || !typedData.primaryType || !typedData.message) {
      res.status(400).json({ error: 'typedData must include domain, types, primaryType, and message' });
      return;
    }

    try {
      const result = await callPara<{ signature: string }>(
        `/v1/wallets/${encodeURIComponent(req.params.walletId)}/sign-typed-data`,
        { method: 'POST', body: { typedData } },
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

app.post(
  '/rest/wallets/:walletId/sign-authorization',
  requireSession,
  requireWalletOwnership(),
  asyncHandler(async (req: Request<{ walletId: string }>, res: Response) => {
    const { authorization } = req.body;

    if (!authorization || typeof authorization !== 'object') {
      res.status(400).json({ error: 'authorization object is required' });
      return;
    }

    const address = authorization.contractAddress ?? authorization.address;
    if (!address || typeof address !== 'string') {
      res.status(400).json({ error: 'authorization.address (or contractAddress) is required' });
      return;
    }

    if (authorization.chainId == null || authorization.nonce == null) {
      res.status(400).json({ error: 'authorization.chainId and authorization.nonce are required' });
      return;
    }

    try {
      const result = await callPara<{
        address: string;
        chainId: number;
        nonce: number;
        r: string;
        s: string;
        yParity: number;
        signature: string;
      }>(`/v1/wallets/${encodeURIComponent(req.params.walletId)}/sign-authorization`, {
        method: 'POST',
        body: { authorization },
      });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  handleError(res, err);
});

app.listen(PORT, () => {
  console.log(`Para REST example listening on http://localhost:${PORT}`);
});
