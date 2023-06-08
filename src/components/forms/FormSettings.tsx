import { useStore } from "@nanostores/react";
import Checkbox from "../inputs/Checkbox";
import { fillFormStore } from "@/stores/fillFormStore";
import { editFormStore } from "@/stores/editFormStore";
import { useEffect, useState } from "react";
import Select from "../inputs/Select";
import { DueDate, formOptions } from "@/types";
import API from "@/client/api";

export default function FormSettings() {
  const form = editFormStore.form.get() || fillFormStore.form.get()!;
  const [allowComments, _setAllowComments] = useState(false);
  const [dueDate, _setDueDate] = useState<DueDate>(DueDate.NONE);
  const [customDueDate, _setCustomDueDate] = useState<string>("");

  const options = formOptions(form);

  useEffect(() => {
    if (!form) return;
    if (options.comments !== undefined) _setAllowComments(options.comments);
    if (options.dueDate !== undefined) _setDueDate(options.dueDate);
    if (options.customDate !== undefined) _setCustomDueDate(options.customDate || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const setComments = (comments: boolean) => {
    options.comments = comments;
    _setAllowComments(comments);
    API.updateForm(form.id, { options });
  };

  const setDueDate = (dueDate: DueDate, custom: string) => {
    options.dueDate = dueDate;
    options.customDate = custom || null;
    _setDueDate(dueDate);
    _setCustomDueDate(custom);
    API.updateForm(form.id, { options });
  };

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      <Checkbox
        id="allowComments"
        label="Allow Comments"
        checked={allowComments}
        onChange={(e) => setComments(e.target.checked)}
      >
        <div>Allow particiants to comment on form questions</div>
      </Checkbox>

      <div>
        <div className="flex my-2 items-center">
          <div className="text-sm font-semibold mr-5">Due Date</div>

          <select
            value={dueDate}
            className="border rounded-md text-sm border-gray-400 flex-1"
            onChange={(e) => setDueDate(e.target.value as DueDate, customDueDate)}
          >
            <option value="">None</option>
            <option value={DueDate.ONE_WEEK}>One week</option>
            <option value={DueDate.TWO_WEEKS}>Two weeks</option>
            <option value={DueDate.ONE_MONTH}>One month</option>
            <option value={DueDate.CUSTOM}>Custom Date</option>
          </select>
        </div>
        {dueDate === DueDate.CUSTOM && (
          <div className="flex items-center">
            <input
              type="date"
              className="border rounded-md text-sm border-gray-400 flex-1"
              value={customDueDate}
              onChange={(e) => setDueDate(dueDate, e.target.value)}
            />
          </div>
        )}
        <div className="text-sm">
          Add a deadline to encourage submissions. Those who have not submitted will receive email
          reminders weekly before the deadline and daily after the deadline. Applies to all new
          invitations.
        </div>
      </div>
    </div>
  );
}
