// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Center, Title } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Center>
      <Title order={1}>Habbit Ruler</Title>
      <div>
        <h1>Index Route</h1>
      </div>
    </Center>
  );
}
