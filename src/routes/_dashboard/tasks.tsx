import { createFileRoute } from "@tanstack/react-router";
import { getTasks } from "@/actions/get-tasks";
import { useQuery } from "@tanstack/react-query";
import AddTaskForm from "@/components/AddTaskForm";

export const Route = createFileRoute("/_dashboard/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  return (
    <div>
      <h1>Tasks</h1>

      <div>
        {data?.map((task: any) => (
          <p key={task.id}>{task.name}</p>
        ))}
      </div>

      <AddTaskForm />
    </div>
  );
}
