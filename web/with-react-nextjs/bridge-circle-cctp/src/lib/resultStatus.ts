export type ResultStatus = "empty" | "pending" | "success" | "error";

interface ResultStatusInput {
  isPending: boolean;
  errorMessage: string | null | undefined;
  value: string | null | undefined;
}

export function getResultStatus({ isPending, errorMessage, value }: ResultStatusInput): ResultStatus {
  if (isPending) {
    return "pending";
  }

  if (errorMessage) {
    return "error";
  }

  if (value) {
    return "success";
  }

  return "empty";
}
