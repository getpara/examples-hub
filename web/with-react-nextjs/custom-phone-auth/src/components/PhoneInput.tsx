import { InputHTMLAttributes } from "react";

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  countryCode: string;
  phoneNumber: string;
  onChange: (data: { countryCode: string; phoneNumber: string }) => void;
}

export const PhoneInput = ({
  label = "Enter your Phone Number",
  countryCode,
  phoneNumber,
  onChange,
  ...props
}: PhoneInputProps) => (
  <label className="w-full flex flex-col">
    <span className="mb-1 text-sm font-medium">{label}</span>
    <div className="flex gap-2">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-none w-20"
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
        className="border border-gray-300 p-2 rounded-none flex-1"
        placeholder="123-456-7890"
        value={phoneNumber}
        onChange={(e) => onChange({ countryCode, phoneNumber: e.target.value })}
        {...props}
      />
    </div>
  </label>
);
