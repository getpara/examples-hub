import type { CountryCodeOption } from "@/types/auth";

interface PhoneFormProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  disabled?: boolean;
  countryCodes: readonly CountryCodeOption[];
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
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-card-foreground">
          Phone number
        </label>
        <div className="grid grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] gap-2">
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled || isPending}
            className="min-h-11 rounded-lg border border-border bg-card px-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted">
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
            className="min-h-11 min-w-0 rounded-lg border border-border bg-card px-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending || !phoneNumber || disabled}
        className="btn-primary min-h-11 w-full px-4 text-sm">
        {isPending ? "Loading..." : "Continue with Phone"}
      </button>
    </form>
  );
}
