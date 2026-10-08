import { Horizon } from "@stellar/stellar-sdk";
import { STELLAR_TESTNET } from "@/lib/chain";

export const horizon = new Horizon.Server(STELLAR_TESTNET.horizonUrl);
