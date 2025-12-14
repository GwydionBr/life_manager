import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/finance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/finance"!</div>
}
