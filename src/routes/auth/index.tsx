import { createFileRoute, redirect } from "@tanstack/react-router";
import { Stack, Card } from "@mantine/core";
import AuthForm from "@/components/Auth/AuthForm";

export const Route = createFileRoute("/auth/")({
  beforeLoad: ({ context }) => {
    if (context.userId) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack align="center" justify="center" h="100vh">
      <Card radius="md" p={0} withBorder w={400}>
        <AuthForm />
      </Card>
    </Stack>
  );
}
