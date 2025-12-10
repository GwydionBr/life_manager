import { useState } from "react";
import { addTask } from "@/actions/add-task";
import { useMutation } from "@tanstack/react-query";

function AddTaskForm() {
  const [taskName, setTaskName] = useState("");

  const { mutate } = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      setTaskName("");
    },
  });

  function onSubmit() {
    mutate({ data: { name: taskName } });
  }

  return (
    <form action={onSubmit}>
      <input
        autoFocus
        type="text"
        name="name"
        placeholder="Enter new task"
        onChange={(e) => setTaskName(e.target.value)}
        value={taskName}
      />
      <button type="submit">Add</button>
    </form>
  );
}
export default AddTaskForm;
