import { createFileRoute } from '@tanstack/react-router'
import FinanceTabs from '@/components/Finances/FinanceTabs';

export const Route = createFileRoute("/_app/finance")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <FinanceTabs />;
}
