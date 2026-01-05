import { Card, CardProps } from "@mantine/core";

interface FinancesNavbarDefaultCardProps extends CardProps {
  children: React.ReactNode;
}
export default function FinancesNavbarDefaultCard({
  children,
  ...props
}: FinancesNavbarDefaultCardProps) {
  return (
    <Card withBorder shadow="sm" radius="lg" {...props}>
      {children}
    </Card>
  );
}
