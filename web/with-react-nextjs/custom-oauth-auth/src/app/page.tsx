import type { Metadata } from "next";
import { CustomOAuthAuthExample } from "@/components/CustomOAuthAuthExample";
import { CustomOAuthAuthPreview } from "@/components/CustomOAuthAuthPreview";

export const metadata: Metadata = {
  title: "Custom OAuth Auth Example",
  description: "Authenticate with Para using your own OAuth buttons.",
};

export default function Home() {
  return (
    <>
      <CustomOAuthAuthPreview />
      <CustomOAuthAuthExample />
    </>
  );
}
