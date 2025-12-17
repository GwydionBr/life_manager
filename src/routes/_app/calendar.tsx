import { createFileRoute } from '@tanstack/react-router'
import WorkCalendar from '@/components/WorkCalendar/WorkCalendar'

export const Route = createFileRoute("/_app/calendar")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <WorkCalendar />
}
