import { Handler } from "@std/http";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { encodeBase64 } from "@std/encoding/base64";
import { decrypt } from "../utils/encryption-utils.ts";
import { RLP } from "@ethereumjs/rlp";

interface RequestBody {
  email: string;
}

export const signWithCapsulePreGen: Handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { email }: RequestBody = await req.json();

  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  const CAPSULE_API_KEY = Deno.env.get("CAPSULE_API_KEY");

  if (!CAPSULE_API_KEY) {
    return new Response("CAPSULE_API_KEY not set", { status: 500 });
  }

  const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);

  const hasPregenWallet = await capsuleClient.hasPregenWallet(email);

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  const keyShare = getKeyShareInDB(email);

  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);

  await capsuleClient.setUserShare(decryptedKeyShare);

  const wallets = await capsuleClient.getWallets();

  const wallet = Object.values(wallets)[0]; //

  const walletId = wallet.id;

  const walletAddress = wallet.address;

  const message = "Sign with Capsule PreGen and Capsule Client";

  const signMessageResult = await capsuleClient.signMessage(walletId, encodeBase64(message));

  const demoRawTx = {
    nonce: "0x00",
    gasPrice: "0x09184e72a000",
    gasLimit: "0x2710",
    to: walletAddress,
    value: "0x00",
    data: "0x",
    v: "0x1c",
    r: "0x",
    s: "0x",
  };

  const rlpEncodedTx = RLP.encode([
    demoRawTx.nonce,
    demoRawTx.gasPrice,
    demoRawTx.gasLimit,
    demoRawTx.to,
    demoRawTx.value,
    demoRawTx.data,
    demoRawTx.v,
    demoRawTx.r,
    demoRawTx.s,
  ]);

  const rlpEncodedTxBase64 = encodeBase64(rlpEncodedTx);

  const signTransactionResult = await capsuleClient.signTransaction(walletId, rlpEncodedTxBase64, "11155111");

  return new Response(JSON.stringify({ route: "signWithCapsulePreGen", signMessageResult, signTransactionResult }), {
    status: 200,
  });
};

// How to run this route with a Terminal command:
// curl -X POST http://localhost:8000/signWithCapsulePreGen -H 'Content-Type: application/json' -H "Authorization: Bearer SIMULATED.$(echo -n ${EMAIL:-user@example.com} | base64)" -d "{\"email\": \"${EMAIL:-user@example.com}\"}"
// Replace email with an example email address to test the route.
