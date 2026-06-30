interface WalletInfoProps {
  address: string;
  balance: string;
  isBalanceLoading: boolean;
  balanceError: string | null;
}

export function WalletInfo({ address, balance, isBalanceLoading, balanceError }: WalletInfoProps) {
  return (
    <section className="px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold text-card-foreground">Connected wallet</h2>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 sm:text-right">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Network</dt>
            <dd className="mt-1 font-medium text-card-foreground">Sepolia</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Balance</dt>
            <dd className="mt-1 font-medium text-card-foreground" data-testid="custom-oidc-balance">
              {balanceError ? balanceError : isBalanceLoading ? "Checking..." : `${balance} ETH`}
            </dd>
          </div>
        </dl>
      </div>
      <p
        className="mt-4 break-all font-mono text-[13px] leading-relaxed text-muted-foreground"
        data-testid="custom-oidc-wallet"
        title={address}>
        {address}
      </p>
    </section>
  );
}
