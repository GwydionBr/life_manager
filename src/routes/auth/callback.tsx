import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { connector } from "@/db/powersync/db";
import { Loader, Center } from "@mantine/core";

export const Route = createFileRoute("/auth/callback")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const session = await connector.getCurrentSession();
      if (session) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/auth" });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <Center h="100vh" w="100vw">
      <Loader />
    </Center>
  );
}
