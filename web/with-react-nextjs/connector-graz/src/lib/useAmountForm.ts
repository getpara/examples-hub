import { useState, type FormEvent } from "react";

function isPositiveAmount(value: string) {
  return /^\d*\.?\d+$/.test(value) && Number(value) > 0;
}

export function useAmountForm(onValidSubmit: (amount: string) => Promise<boolean>) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string>();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPositiveAmount(amount)) {
      setError("Enter an amount greater than 0.");
      return;
    }

    setError(undefined);

    if (await onValidSubmit(amount)) {
      setAmount("");
    }
  };

  return { amount, setAmount, error, submit };
}
