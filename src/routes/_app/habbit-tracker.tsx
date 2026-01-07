import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/_app/habbit-tracker")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <div>Habbit-Tracker</div>
}
