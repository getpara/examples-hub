"use client";

import { InputHTMLAttributes } from "react";

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  countryCode: string;
  phoneNumber: string;
  onChange: (data: { countryCode: string; phoneNumber: string }) => void;
}

export function PhoneInput({
  label = "Enter your Phone Number",
  countryCode,
  phoneNumber,
  onChange,
  ...props
}: PhoneInputProps) {
  return (
    <label className="w-full flex flex-col">
      <span className="mb-2 text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-2">
        <input
          type="text"
          className="border border-gray-300 px-3 py-2 rounded-none w-20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          placeholder="+1"
          value={countryCode}
          onChange={(e) => {
            const newCode = e.target.value.startsWith("+") ? e.target.value : `+${e.target.value}`;
            onChange({ countryCode: newCode, phoneNumber });
          }}
          {...props}
        />
        <input
          type="tel"
          className="border border-gray-300 px-3 py-2 rounded-none flex-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          placeholder="123-456-7890"
          value={phoneNumber}
          onChange={(e) => onChange({ countryCode, phoneNumber: e.target.value })}
          {...props}
        />
      </div>
    </label>
  );
}
