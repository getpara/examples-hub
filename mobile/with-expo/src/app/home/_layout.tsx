import { HomeNavigation } from "@/navigation";
import { WalletProvider } from "@/providers/wallet/walletContext";

export default function HomeLayout() {
  return (
    <WalletProvider>
      <HomeNavigation />
    </WalletProvider>
  );
}
