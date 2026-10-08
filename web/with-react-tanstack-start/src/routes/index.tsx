import { createFileRoute } from "@tanstack/react-router";
import { ParaModalExample } from "@/components/ParaModalExample";

export const Route = createFileRoute("/")({
  component: ParaModalExample,
});
