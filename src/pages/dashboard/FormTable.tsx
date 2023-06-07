import Table, { Header, tableLinkStyle } from "@/components/table/Table";
import { pluralize } from "@/lib/utils";
import { FormWithFill, dashboardStore } from "@/stores/dashboardStore";
import { DocumentDuplicateIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { Form } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function FormTable() {
  const forms = useStore(dashboardStore.forms);

  return <Table headers={headers} items={forms} renderCell={renderCell} />;
}

const headers: Header[] = [
  { name: "Name", className: "sm:pl-0 w-full" },
  { name: "Status", className: "hidden md:table-cell w-auto whitespace-nowrap" },
  {
    name: "Last Updated",
    className: "hidden lg:table-cell w-40 whitespace-nowrap",
    cellClassName: "text-gray-500",
  },
  { name: "", className: "w-32", cellClassName: "flex justify-end gap-4" },
];

const deleteForm = async (form: FormWithFill) => {
  dashboardStore.deleteFormModal.set(form);
};

const cloneForm = async (form: FormWithFill) => {};

const renderCell = (form: FormWithFill, header: Header) => {
  if (header == headers[0]) {
    return (
      <>
        <Link href={`/forms/${form.id}`} className={tableLinkStyle}>
          {form.name || "Untitled Form"}
        </Link>

        <dl className="font-normal md:hidden">
          <dt className="sr-only">Status</dt>
          <dd className="mt-1 truncate text-gray-700">{formStatus(form)}</dd>
        </dl>
      </>
    );
  } else if (header == headers[1]) {
    return formStatus(form);
  } else if (header == headers[2]) {
    return formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true }).replace("about ", "");
  } else if (header == headers[3]) {
    return (
      <>
        <Link
          href={`/forms/preview/${form.id}`}
          className={tableLinkStyle}
          target="_blank"
          data-tooltip-content="Preview & Share"
          data-tooltip-id="tooltip"
        >
          <ShareIcon className="w-5 h-5" />
        </Link>

        <div
          onClick={() => cloneForm(form)}
          className={tableLinkStyle}
          data-tooltip-content="Duplicate"
          data-tooltip-id="tooltip"
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
        </div>

        <div
          onClick={() => deleteForm(form)}
          className="hover:underline text-red-500 cursor-pointer"
          data-tooltip-content="Delete"
          data-tooltip-id="tooltip"
        >
          <TrashIcon className="w-5 h-5" />
        </div>
      </>
    );
  }
};

const showResponses = async (form: FormWithFill) => {
  dashboardStore.responsesModal.set(form);
};

function formStatus(form: FormWithFill) {
  if (form.completedAt) return <div className="text-slate-900">Completed</div>;
  if (form.formFills?.length) {
    const hasCompleted = form.formFills.some((fill) => fill.submittedAt);
    const linkStyle = hasCompleted ? "" : "text-gray-500";
    return (
      <div onClick={() => showResponses(form)} className={twMerge(tableLinkStyle, linkStyle)}>
        {formResponses(form)}
      </div>
    );
  }
  if (form.slug) return <div className="text-green-900">Published</div>;
  return "Draft";
}

function formResponses(form: FormWithFill) {
  if (!form.formFills) return "";

  const results: string[] = [];

  const complete = form.formFills.filter((fill) => fill.submittedAt).length;
  const started = form.formFills.filter((fill) => !fill.submittedAt && fill.completed > 0).length;

  if (complete > 0) results.push(pluralize(complete, "completed response"));
  if (started > 0) results.push(pluralize(started, "partial response"));
  if (results.length == 0) results.push("Awaiting responses");

  return (
    <>
      {results.map((result, index) => (
        <div key={index}>{result}</div>
      ))}
    </>
  );
}
