import { DueDate, formOptions } from "@/types";
import { Form } from "@prisma/client";
import { add } from "date-fns";

export const createDueDate = (form: Form) => {
  const options = formOptions(form);
  if (!options.dueDate) {
    return null;
  }

  switch (options.dueDate) {
    case DueDate.ONE_WEEK:
      return add(new Date(), { weeks: 1 });
    case DueDate.TWO_WEEKS:
      return add(new Date(), { weeks: 2 });
    case DueDate.ONE_MONTH:
      return add(new Date(), { months: 1 });
    case DueDate.CUSTOM:
      return options.customDate ? new Date(options.customDate) : null;
  }

  return null;
};
