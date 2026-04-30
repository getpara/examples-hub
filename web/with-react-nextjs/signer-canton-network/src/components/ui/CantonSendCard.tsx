"use client";

import { useState } from "react";

interface CantonSendCardProps {
  onSend: (input: { receiverPartyId: string; amount: string; memo?: string }) => void;
  isPending: boolean;
  error: Error | null;
  preparedHash?: string;
  updateId?: string;
  defaultReceiverPartyId?: string;
  defaultAmount?: string;
}

export function CantonSendCard({
  onSend,
  isPending,
  error,
  preparedHash,
  updateId,
  defaultReceiverPartyId = "",
  defaultAmount = "1",
}: CantonSendCardProps) {
  const [receiverPartyId, setReceiverPartyId] = useState(defaultReceiverPartyId);
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState("");

  const canSend =
    receiverPartyId.trim().length > 0 &&
    amount.trim().length > 0 &&
    !isPending;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Send Amulet</h2>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive">
              {error.message || "Send failed. Please try again."}
            </p>
          </div>
        )}

        {updateId && !error && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">
              Transfer submitted — Canton has accepted the signed transaction.
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Sends Amulet from this party to a recipient. Same prepare → Para-sign → execute loop as
          the preapproval install — only the prepared command changes (token-standard{" "}
          <code className="font-mono">createTransfer</code> instead of
          {" "}
          <code className="font-mono">TransferPreapprovalProposal</code>). If the recipient has a
          TransferPreapproval, the transfer auto-completes; otherwise it creates a pending
          TransferInstruction the recipient must accept.
        </p>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="canton-send-receiver">
            Recipient partyId
          </label>
          <input
            id="canton-send-receiver"
            data-testid="canton-send-receiver-input"
            value={receiverPartyId}
            onChange={(e) => setReceiverPartyId(e.target.value)}
            placeholder="party::namespace"
            spellCheck={false}
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="canton-send-amount">
            Amount
          </label>
          <input
            id="canton-send-amount"
            data-testid="canton-send-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            inputMode="decimal"
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="canton-send-memo">
            Memo (optional)
          </label>
          <input
            id="canton-send-memo"
            data-testid="canton-send-memo-input"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="hello canton"
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
          />
        </div>

        <button
          onClick={() => onSend({ receiverPartyId, amount, memo: memo || undefined })}
          data-testid="canton-send-button"
          disabled={!canSend}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending ? "Sending..." : "Send Amulet"}
        </button>

        {preparedHash && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">preparedTransactionHash (signed by Para)</p>
            <div className="rounded-xl bg-muted/60 px-4 py-3 break-all">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {preparedHash}
              </code>
            </div>
          </div>
        )}

        {updateId && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">updateId</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="canton-send-update-id-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {updateId}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
