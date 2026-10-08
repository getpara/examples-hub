import { useCallback, useState } from "react";
import { hashPreparedTransaction } from "@canton-network/core-tx-visualizer";
import { base58ToBase64, useSignMessage } from "@getpara/react-sdk-lite";
import { postCanton } from "@/lib/cantonApi";
import type { PreparedSubmission } from "@/lib/cantonTypes";

export type CantonCommand = "preapproval" | "tap" | "transfer";

export type CantonCommandInput = Record<string, string | undefined>;

interface CantonSubmissionOptions {
  command: CantonCommand;
  partyId: string | null;
  address: string;
  walletId: string | undefined;
}

interface PrepareResponse {
  preparedTransactionHash: string;
  prepared: PreparedSubmission;
  commandId: string;
}

interface SubmissionState {
  partyId: string;
  isPending: boolean;
  errorMessage: string | null;
  preparedHash: string | null;
  updateId: string | null;
}

export function useCantonSubmission({ command, partyId, address, walletId }: CantonSubmissionOptions) {
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<SubmissionState | null>(null);

  const submit = useCallback(
    async (input: CantonCommandInput = {}) => {
      if (!partyId) {
        return;
      }

      const update = (changes: Partial<SubmissionState>) =>
        setState((current) => ({ ...(current ?? initialState(partyId)), ...changes, partyId }));

      setState({ ...initialState(partyId), isPending: true });

      try {
        if (!address || !walletId) {
          throw new Error("No Para wallet available. Connect first.");
        }

        const { preparedTransactionHash, prepared, commandId } = await postCanton<PrepareResponse>(
          `${command}/prepare`,
          { partyId, ...input }
        );

        if (!prepared.preparedTransaction) {
          throw new Error("Canton returned no prepared transaction.");
        }

        const recomputedHash = await hashPreparedTransaction(prepared.preparedTransaction, "base64");
        if (recomputedHash !== preparedTransactionHash) {
          throw new Error(
            "Prepared transaction hash mismatch. The server returned a hash that does not match the prepared transaction, so Para did not sign it."
          );
        }
        update({ preparedHash: preparedTransactionHash });

        const result = await signMessageAsync({ walletId, messageBase64: preparedTransactionHash });
        if (!("signature" in result) || !result.signature) {
          throw new Error("Para signing was denied or returned no signature.");
        }

        const { updateId } = await postCanton<{ updateId: string }>(`${command}/execute`, {
          partyId,
          prepared,
          signatureBase64: result.signature,
          publicKeyBase64: base58ToBase64(address),
          commandId,
        });
        update({ updateId, isPending: false });
      } catch (error) {
        update({
          errorMessage: error instanceof Error ? error.message : "Canton submission failed.",
          isPending: false,
        });
      }
    },
    [command, partyId, address, walletId, signMessageAsync]
  );

  const current = state && state.partyId === partyId ? state : null;

  return {
    submit,
    isPending: current?.isPending ?? false,
    errorMessage: current?.errorMessage ?? null,
    preparedHash: current?.preparedHash ?? null,
    updateId: current?.updateId ?? null,
  };
}

function initialState(partyId: string): SubmissionState {
  return { partyId, isPending: false, errorMessage: null, preparedHash: null, updateId: null };
}
