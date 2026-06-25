import type { Metadata } from "next";
import { CustomOidcAuthExample } from "@/components/CustomOidcAuthExample";

export const metadata: Metadata = {
  title: "Custom OIDC Auth Example",
  description: "Custom OIDC sign-in driven directly by the Para web SDK.",
};

export default function Home() {
  return <CustomOidcAuthExample />;
}
