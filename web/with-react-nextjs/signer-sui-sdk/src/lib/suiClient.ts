import { SuiGrpcClient } from "@mysten/sui/grpc";
import { SUI_TESTNET } from "@/lib/chain";

export const suiClient = new SuiGrpcClient({ network: SUI_TESTNET.network, baseUrl: SUI_TESTNET.rpcUrl });
