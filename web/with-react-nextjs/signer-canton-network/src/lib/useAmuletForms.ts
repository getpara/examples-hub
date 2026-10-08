import { useState } from "react";

export function useTapForm() {
  const [amount, setAmount] = useState("100");

  return {
    amount,
    setAmount,
    canSubmit: amount.trim().length > 0,
    input: { amount: amount.trim() },
  };
}

export function useTransferForm(defaultReceiverPartyId: string) {
  const [receiverPartyId, setReceiverPartyId] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("");
  const receiver = receiverPartyId ?? defaultReceiverPartyId;

  return {
    receiverPartyId: receiver,
    setReceiverPartyId,
    amount,
    setAmount,
    memo,
    setMemo,
    canSubmit: receiver.trim().length > 0 && amount.trim().length > 0,
    input: { receiverPartyId: receiver.trim(), amount: amount.trim(), memo: memo.trim() || undefined },
  };
}
