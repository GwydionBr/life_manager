import { Stack } from "@mantine/core";

interface FinancesNavbarProps {
  items: React.ReactNode[];
}

export default function FinancesNavbar({ items }: FinancesNavbarProps) {
  return (
    <Stack w={200} miw={190}>
      {items.map((item) => item)}
    </Stack>
  );
}
