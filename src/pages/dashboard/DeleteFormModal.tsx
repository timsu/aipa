import { Provider } from "next-auth/providers";
import { ClientSafeProvider, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

import Modal, { ModalBody, ModalButton } from "@/components/modals/Modal";
import { fillFormStore } from "@/stores/fillFormStore";
import { TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import Image from "next/image";
import { dashboardStore } from "@/stores/dashboardStore";

type Props = {};

export default function DeleteFormModal({}: Props) {
  const form = useStore(dashboardStore.deleteFormModal);
  const open = !!form;

  const setOpen = (open: boolean) => {
    if (!open) dashboardStore.deleteFormModal.set(undefined);
  };

  const buttons = (
    <>
      <ModalButton
        onClick={() => {
          dashboardStore.deleteForm(form!);
          setOpen(false);
        }}
        className="bg-red-600 hover:bg-red-800"
      >
        Delete
      </ModalButton>
      <ModalButton onClick={() => setOpen(false)} className="bg-gray-600 hover:bg-gray-800">
        Cancel
      </ModalButton>
    </>
  );

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalBody
        title={"Delete " + (form?.name || "Form")}
        icon={<TrashIcon className="w-6 h-6 text-red-600" />}
        iconBg="bg-red-100"
        buttons={buttons}
        className="sm:min-w-[500px]"
      >
        <p className="text-gray-500">Delete this {!form?.slug ? "draft" : "published"} form?</p>
        {form?.formFills?.length ? (
          <p className="mt-2 font-bold">You will also lose all responses.</p>
        ) : form?.slug ? (
          <p className="mt-2">Recipients will no longer be able to access the link.</p>
        ) : null}
      </ModalBody>
    </Modal>
  );
}
