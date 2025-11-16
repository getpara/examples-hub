import { InputHTMLAttributes } from "react";

interface EmailInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const EmailInput = ({ label = "Enter your Email", ...props }: EmailInputProps) => (
  <label className="w-full flex flex-col">
    <span className="mb-1 text-sm font-medium">{label}</span>
    <input
      type="email"
      className="border border-gray-300 p-2 rounded-none"
      placeholder="you@example.com"
      {...props}
    />
  </label>
);
