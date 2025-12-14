import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { IntlExample } from "@/components/examples/IntlExample";

export const Route = createFileRoute("/_app/test")({
  component: Test,
});

function Test() {
  return (
    <Stack align="center">
      <IntlExample />
    </Stack>
  );
}
