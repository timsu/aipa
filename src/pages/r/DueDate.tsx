import { fillFormStore } from "@/stores/fillFormStore";
import { useStore } from "@nanostores/react";
import { formatDistanceToNow, isAfter } from "date-fns";

export default function DueDate() {
  const formFill = useStore(fillFormStore.formFill);

  if (!formFill || !formFill.dueAt) return null;

  if (isAfter(new Date(), new Date(formFill.dueAt))) {
    return <div className="text-red-500">This form is past due.</div>;
  }

  return (
    <div className="text-gray-500">
      This form is due in {formatDistanceToNow(new Date(formFill.dueAt))}.
    </div>
  );
}
