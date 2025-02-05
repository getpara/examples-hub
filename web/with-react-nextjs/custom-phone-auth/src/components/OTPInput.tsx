import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  label?: string;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  label = "Verification Code",
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpArray = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValue = otpArray.map((char, i) => (i === index ? inputValue.slice(-1) : char)).join("");

    onChange(newValue);

    if (inputValue && index < length - 1) {
      focusInput(index + 1);
    }

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d*$/.test(pastedData)) return;

    const newValue = pastedData.padEnd(length, "").slice(0, length);
    onChange(newValue);

    const focusIndex = Math.min(pastedData.length, length - 1);
    focusInput(focusIndex);

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className="w-12 h-12 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            autoComplete="off"
          />
        ))}
      </div>
    </div>
  );
};
