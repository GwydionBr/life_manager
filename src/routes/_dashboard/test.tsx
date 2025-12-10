import { Center, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { getTest } from "@/actions/get-test";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_dashboard/test")({
  component: Test,
});

function Test() {
  const { data = [] } = useQuery({
    queryKey: ["test"],
    queryFn: getTest,
  });
  console.log(data);
  return (
    <Stack align="center">
      <Title order={1}>Test Route</Title>
      {data.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </Stack>
  );
}
