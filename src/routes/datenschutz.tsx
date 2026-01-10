// src/routes/datenschutz.tsx
import { createFileRoute } from "@tanstack/react-router";
import Datenschutz from "@/components/Legal/Datenschutz";


export const Route = createFileRoute("/datenschutz")({
  component: Datenschutz,
});


