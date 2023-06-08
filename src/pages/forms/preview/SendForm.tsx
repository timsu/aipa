import { useEffect, useMemo, useState } from "react";

import Modal, { ModalBody, ModalIcon, ModalShell } from "@/components/modals/Modal";
import API from "@/client/api";
import { editFormStore } from "@/stores/editFormStore";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { fillFormStore } from "@/stores/fillFormStore";
import TextField from "@/components/inputs/TextField";
import { useSession } from "next-auth/react";
import TextArea from "@/components/inputs/TextArea";
import { userMeta } from "@/types";
import { unwrapError } from "@/lib/utils";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import Checkbox from "@/components/inputs/Checkbox";

export default function SendForm({ close }: { close: () => void }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  const session = useSession();
  const [emails, setEmails] = useState("");
  const [error, setError] = useState<string | undefined>();

  const [fromName, setFromName] = useState("");
  const form = useStore(fillFormStore.form);
  const [submitting, setSubmitting] = useState(false);

  const defaultFrom = useMemo(() => {
    const dbUser = session.data?.dbUser;
    const defaultFrom = userMeta(dbUser).from;
    return defaultFrom || defaultFromName(session.data?.user);
  }, [session]);

  useEffect(() => {
    editFormStore.loadSlug().then(setLink);
  }, []);

  const onDone = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await editFormStore.sendForm(fromName, defaultFrom, emails);
      close();
    } catch (e: any) {
      const message = unwrapError(e);
      setError(message);
      return;
    } finally {
      setSubmitting(false);
    }
  };

  const copy = () => {
    setCopied(true);
    navigator.clipboard.writeText(link);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="">
      <div className="flex flex-col space-y-4">
        <p className="text-gray-500">
          Please type a list of emails to send to, separated by commas or newlines:
        </p>

        <TextArea
          placeholder="name@example.com"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />

        <p className="text-gray-500">Send From (i.e. Tim from DocGet):</p>

        <TextField
          id="fromName"
          placeholder={"Your name"}
          value={fromName || defaultFrom}
          onChange={(e) => setFromName(e.target.value)}
        />

        <div className="border-b" />

        <p className="text-gray-500">
          or copy this link to send your form. Your recipients will need to authenticate their
          email.
        </p>

        <div className="my-4 border pr-2 flex bg-gray-100 rounded items-center cursor-pointer">
          <input
            type="text"
            value={link}
            className="p-2 bg-gray-100 flex-1 mr-2 text-slate-800 border-none"
            readOnly
            onClick={(e) => {
              (e.target as HTMLInputElement).select();
              copy();
            }}
          />
          <div className={copied ? "text-green-600" : "text-gray-500"} onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </div>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto disabled:bg-gray-600"
            onClick={() => onDone()}
            disabled={submitting}
          >
            {submitting ? "Sending" : emails ? "Send" : "Done"}
            {emails && <PaperAirplaneIcon className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}

const defaultFromName = (user: { name: string; email: string } | undefined) => {
  if (!user) return "";
  if (!user.name) return user.email;

  const domainParts = user.email.split("@")[1].split(".");
  const companyName = domainParts[domainParts.length - 2];

  const capitalized = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  return `${user.name} from ${capitalized}`;
};
