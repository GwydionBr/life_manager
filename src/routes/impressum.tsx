// src/routes/impressum.tsx
import { createFileRoute } from "@tanstack/react-router";
import Impressum from "@/components/Legal/Impressum";

export const Route = createFileRoute("/impressum")({
  component: Impressum,
});
