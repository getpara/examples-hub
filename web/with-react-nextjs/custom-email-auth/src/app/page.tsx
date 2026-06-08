import type { Metadata } from "next";
import { CustomEmailAuthExample } from "@/components/CustomEmailAuthExample";
import { CustomEmailAuthPreview } from "@/components/CustomEmailAuthPreview";

export const metadata: Metadata = {
  title: "Custom Email Auth Example",
  description: "Authenticate with Para using custom email OTP UI.",
};

export default function Home() {
  return (
    <>
      <CustomEmailAuthPreview />
      <CustomEmailAuthExample />
    </>
  );
}
