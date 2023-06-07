import { Provider } from "next-auth/providers";
import { ClientSafeProvider, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

import Modal, { ModalBody, ModalButton } from "@/components/modals/Modal";
import { fillFormStore } from "@/stores/fillFormStore";
import { TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import Image from "next/image";
import { FillWithUser, dashboardStore } from "@/stores/dashboardStore";
import Table, { Header, tableLinkStyle } from "@/components/table/Table";
import { FormFill } from "@prisma/client";
import Link from "next/link";
import { formatRelative } from "date-fns";

type Props = {};

export default function ResponsesModal({}: Props) {
  const form = useStore(dashboardStore.responsesModal);
  const open = !!form;

  const setOpen = (open: boolean) => {
    if (!open) dashboardStore.responsesModal.set(undefined);
  };

  const buttons = (
    <>
      <ModalButton onClick={() => setOpen(false)} className="bg-gray-600 hover:bg-gray-800">
        Close
      </ModalButton>
    </>
  );

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalBody
        title={(form?.name || "Form") + " Responses"}
        buttons={buttons}
        className="w-full sm:w-[60rem] sm:max-w-3xl"
      >
        <div className="w-full min-h-[20rem] overflow-scroll">
          <ResponsesTable />
        </div>
      </ModalBody>
    </Modal>
  );
}

function ResponsesTable() {
  const form = useStore(dashboardStore.responsesModal);
  const fills = useStore(dashboardStore.formFills)[form?.id ?? 0];

  useEffect(() => {
    if (!form) return;
    dashboardStore.loadFills(form);
  }, [form]);

  if (!form) return null;

  if (!fills) return <div className="text-gray-500">Loading...</div>;

  return <Table headers={headers} items={fills} renderCell={renderCell} />;
}

const headers: Header[] = [
  { name: "Email", className: "sm:pl-0 w-full" },
  { name: "Status", className: "hidden md:table-cell w-auto whitespace-nowrap" },
  {
    name: "Submitted",
    className: "hidden lg:table-cell min-w-[7rem]",
    cellClassName: "text-gray-500",
  },
  {
    name: "Last Updated",
    className: "hidden lg:table-cell min-w-[7rem]",
    cellClassName: "text-gray-500",
  },
  { name: "", className: "w-4", cellClassName: "flex justify-end gap-4" },
];

const renderCell = (fill: FillWithUser, header: Header) => {
  if (header == headers[0]) {
    return fill.submittedAt ? (
      <Link href={`/forms/responses/${fill.id}`} className={tableLinkStyle} target="_blank">
        {fill.user?.email}
      </Link>
    ) : (
      fill.user?.email
    );
  } else if (header == headers[1]) {
    return fillStatus(fill);
  } else if (header == headers[2]) {
    return (
      fill.submittedAt &&
      formatRelative(new Date(fill.submittedAt), new Date()).replace("last ", "")
    );
  } else if (header == headers[3]) {
    return formatRelative(new Date(fill.updatedAt), new Date()).replace("last ", "");
  }
};

function fillStatus(fill: FillWithUser) {
  if (fill.submittedAt) return <span className="text-green-800 font-semibold w-64">Submitted</span>;
  if (fill.completed) return <span className="text-yellow-800">{fill.completed}% complete</span>;
  if (fill.startedAt) return <span className="text-gray-500">opened</span>;
  return <span className="text-gray-500">sent</span>;
}
