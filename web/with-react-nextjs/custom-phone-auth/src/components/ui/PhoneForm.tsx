interface CountryCode {
  code: string;
  label: string;
}

interface PhoneFormProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  disabled?: boolean;
  countryCodes: readonly CountryCode[];
}

export function PhoneForm({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  onSubmit,
  isPending,
  disabled,
  countryCodes,
}: PhoneFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone number
        </label>
        <div className="flex gap-2">
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled || isPending}
            className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
            {countryCodes.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="(555) 123-4567"
            disabled={disabled || isPending}
            className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending || !phoneNumber || disabled}
        className="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
        {isPending ? "Loading..." : "Continue with Phone"}
      </button>
    </form>
  );
}
