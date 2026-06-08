import type { Metadata } from "next";
import { CustomPhoneAuthExample } from "@/components/CustomPhoneAuthExample";
import { CustomPhoneAuthPreview } from "@/components/CustomPhoneAuthPreview";

export const metadata: Metadata = {
  title: "Custom Phone Auth Example",
  description: "Authenticate with Para using your own phone number UI.",
};

export default function Home() {
  return (
    <>
      <CustomPhoneAuthPreview />
      <CustomPhoneAuthExample />
    </>
  );
}
