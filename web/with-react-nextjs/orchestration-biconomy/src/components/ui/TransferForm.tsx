"use client";

import { useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { formatUnits } from "viem";
import { DEFAULT_TRANSFER_AMOUNT, USDC_DECIMALS } from "@/lib/biconomy";

interface TransferFormProps {
  onExecute: (recipients: string[]) => Promise<void>;
  isPending: boolean;
  status: string | null;
  meeScanLink: string | null;
  error: Error | null;
  isReady: boolean;
}

export function TransferForm({
  onExecute,
  isPending,
  status,
  meeScanLink,
  error,
  isReady,
}: TransferFormProps) {
  const [recipients, setRecipients] = useState<string[]>([""]);

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const addRecipient = () => setRecipients([...recipients, ""]);

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    await onExecute(recipients);
  };

  const transferAmount = formatUnits(DEFAULT_TRANSFER_AMOUNT, USDC_DECIMALS);
  const totalAmount = formatUnits(
    DEFAULT_TRANSFER_AMOUNT * BigInt(recipients.filter((r) => r.trim()).length || 1),
    USDC_DECIMALS
  );

  return (
    <div className="bg-white rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Quick Transfer</h3>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients ({transferAmount} USDC each)
          </label>

          <div className="space-y-2">
            {recipients.map((recipient, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-500 text-xs font-medium rounded-none">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => handleRecipientChange(idx, e.target.value)}
                  placeholder="Enter 0x address"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
                <button
                  onClick={() => removeRecipient(idx)}
                  disabled={recipients.length === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRecipient}
            className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add another recipient
          </button>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-none mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Transfer amount:</span>
            <span className="font-medium text-gray-900">{totalAmount} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Gas payment:</span>
            <span className="font-medium text-gray-900">Paid in USDC (not ETH)</span>
          </div>
        </div>

        {status && !error && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-none">
            <p className="text-sm text-gray-700">{status}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-none">
            <p className="text-sm text-red-700 break-words">{error.message}</p>
          </div>
        )}

        {meeScanLink && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-none">
            <p className="text-sm text-green-700 font-medium mb-2">Transaction successful!</p>
            <a
              href={meeScanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition-colors">
              View on MEE Scan <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || !isReady}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
          {isPending ? "Processing..." : isReady ? "Pay Now" : "Setting up Biconomy MEE..."}
        </button>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Powered by Biconomy MEE • Single signature for all transfers
        </p>
      </div>
    </div>
  );
}

