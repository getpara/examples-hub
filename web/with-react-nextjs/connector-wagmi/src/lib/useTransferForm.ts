import { useState, type FormEvent } from "react";
import type { Address } from "viem";

interface TransferRequest {
  to: Address;
  amount: string;
}

interface TransferFormErrors {
  to?: string;
  amount?: string;
}

function isEthereumAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isPositiveAmount(value: string) {
  return /^\d*\.?\d+$/.test(value) && Number(value) > 0;
}

export function useTransferForm(onValidSubmit: (request: TransferRequest) => void) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<TransferFormErrors>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: TransferFormErrors = {
      to: isEthereumAddress(to) ? undefined : "Enter a valid address that starts with 0x.",
      amount: isPositiveAmount(amount) ? undefined : "Enter an amount greater than 0.",
    };
    setErrors(nextErrors);

    if (isEthereumAddress(to) && !nextErrors.amount) {
      onValidSubmit({ to, amount });
    }
  };

  return { to, setTo, amount, setAmount, errors, submit };
}
