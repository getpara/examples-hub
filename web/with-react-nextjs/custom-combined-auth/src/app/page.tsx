import type { Metadata } from "next";
import { CustomCombinedAuthExample } from "@/components/CustomCombinedAuthExample";
import { CustomCombinedAuthPreview } from "@/components/CustomCombinedAuthPreview";

export const metadata: Metadata = {
  title: "Custom Combined Auth Example",
  description: "Authenticate with Para using custom email, phone, and OAuth UI.",
};

export default function Home() {
  return (
    <>
      <CustomCombinedAuthPreview />
      <CustomCombinedAuthExample />
    </>
  );
}
