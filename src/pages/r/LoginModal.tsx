import { Provider } from "next-auth/providers";
import { ClientSafeProvider, signIn } from "next-auth/react";
import { FormEvent, useEffect, useRef, useState } from "react";

import Modal, { ModalBody } from "@/components/modals/Modal";
import { fillFormStore } from "@/stores/fillFormStore";
import { UserIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import Image from "next/image";
import { toast } from "react-toastify";

type Props = {
  csrfToken: string;
  providers: Record<string, ClientSafeProvider>;
  isOwner: boolean;
};

const query = typeof location != "undefined" ? new URLSearchParams(location.search) : null;

export default function LoginModal({ csrfToken, providers, isOwner }: Props) {
  const [email, setEmail] = useState(
    query?.get("email") || (isOwner ? "someone@somewhere.com" : "")
  );
  const [submitting, setSubmitting] = useState(false);
  const form = useStore(fillFormStore.form);
  const open = useStore(fillFormStore.loginModal);
  const emailButton = useRef<HTMLButtonElement>(null);

  const oauthProviders = Object.values(providers || {}).filter((p) => p.type == "oauth");

  useEffect(() => {
    if (!form || !open) return;
    if (query?.get("token")) {
      setTimeout(() => emailButton.current?.focus(), 0);
    }
  }, [form, open]);

  const buttons = (
    <>
      <button
        ref={emailButton}
        disabled={!email || submitting}
        className="inline-flex w-full justify-center rounded-md bg-blue-600 disabled:bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
      >
        {submitting ? "Submitting" : "Continue with Email"}
      </button>
    </>
  );

  const setOpen = (open: boolean) => {
    // don't let people dismiss
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate email
    if (!email || !email.includes("@")) return;
    if (isOwner) {
      fillFormStore.loginModal.set(false);
      return;
    }

    setSubmitting(true);
    try {
      const token = query?.get("token");
      if (token) {
        const email = query?.get("email");
        await signIn("credentials", {
          email,
          token,
          callbackUrl: location.pathname + "?email=" + email,
        });
      } else {
        await signIn("email", { email, callbackUrl: window.location.href });
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error signing in: " + e.message);
    }
    setSubmitting(false);
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit}>
        <ModalBody
          title={form?.name || "Form"}
          icon={<UserIcon className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-100"
          buttons={buttons}
        >
          <p className="text-gray-500">
            Welcome to DocGet, the best way to request information. Please sign in with OAuth or
            provide your email to continue.
          </p>

          <div className="flex flex-col items-center sm:ml-[-50px] mt-6 gap-2">
            {oauthProviders.map((provider) => (
              <div key={provider.name} className="">
                <button
                  onClick={() => signIn(provider.id, { callback: location.href })}
                  className="flex items-center w-full rounded-md border px-3 py-2 text-sm font-semibold shadow-sm hover:bg-blue-200 sm:ml-3 sm:w-auto"
                >
                  <Image
                    src={`https://authjs.dev/img/providers/${provider.id}.svg`}
                    width={24}
                    height={24}
                    className="mr-4"
                    alt="logo"
                  />
                  <div>Sign in with {provider.name}</div>
                </button>
              </div>
            ))}
            <div>or</div>
          </div>

          <div className="my-4 sm:ml-[-20px] sm:mr-[20px] items-center flex">
            <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
            <input
              name="email"
              autoComplete="on"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 flex-1 mr-2 text-slate-800 rounded border border-gray-200"
            />
          </div>
          {isOwner && (
            <div className="mt-4 sm:ml-[-20px] mr-[5px] sm:mr-[25px] p-2 bg-blue-50 rounded text-blue-600">
              This is a preview of what your recipient will see.
            </div>
          )}
        </ModalBody>
      </form>
    </Modal>
  );
}
