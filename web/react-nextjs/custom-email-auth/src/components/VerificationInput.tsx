import React, { InputHTMLAttributes } from "react";

interface VerificationInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const VerificationInput: React.FC<VerificationInputProps> = ({ label = "Verification Code", ...props }) => (
  <label className="w-full flex flex-col">
    <span className="mb-1 text-sm font-medium">{label}</span>
    <input
      type="text"
      className="border border-gray-300 p-2 rounded-none"
      placeholder="Enter the OTP from your email"
      {...props}
    />
  </label>
);
