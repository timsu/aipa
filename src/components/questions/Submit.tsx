import { useEffect, useState } from "react";

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import { useStore } from "@nanostores/react";
import { fillFormStore } from "@/stores/fillFormStore";
import { logger } from "@/lib/logger";

export type SubmitResult = { label: string; class?: string };

type Props = {
  disabled?: boolean;
  onSubmit: () => Promise<void>;
};

export default function Submit(props: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    label: "Please fill out the form",
  });
  const { disabled, onSubmit } = props;

  const hasSubmitted = fillFormStore.formFill.get()?.submittedAt;
  const hasAnswers = Object.keys(useStore(fillFormStore.answers)).length > 0;
  useEffect(() => {
    if (hasSubmitted) {
      setSubmitResult({
        label: "Update Submission",
        class: "text-white bg-blue-500 hover:bg-blue-600",
      });
    } else if (hasAnswers) {
      setSubmitResult({ label: "Submit", class: "text-white bg-blue-500 hover:bg-blue-600" });
    }
  }, [hasAnswers, hasSubmitted]);

  const submit = async () => {
    if (disabled) return;
    setSubmitting(true);
    setSubmitResult({ label: "Validating..." });
    try {
      const result = await fillFormStore.validateForm();
      if (result) {
        setSubmitResult({
          label: "Looks good!",
          class: "text-white bg-green-500 hover:bg-green-600",
        });
        await onSubmit();
      } else {
        setSubmitResult({
          label: "Please fix errors and try again",
          class: "text-white font-bold bg-red-500 hover:bg-red-600",
        });
      }
    } catch (e) {
      logger.error(e);
      setSubmitResult({
        label: "Something went wrong. Please try again.",
        class: "text-white font-bold bg-red-500 hover:bg-red-600",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <button
        className={twMerge(
          `w-full submit bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md p-4 mt-20 cursor-pointer 
          flex items-center justify-center select-none`,
          submitting && "animate-bounce",
          submitResult.class
        )}
        tabIndex={0}
        onClick={() => submit()}
        disabled={disabled}
      >
        {submitResult.label}
        <PaperAirplaneIcon className="inline-block w-4 h-4 ml-2" />
      </button>
      {hasSubmitted && (
        <div className="mt-4 text-center text-gray-500">
          Submitted on {new Date(hasSubmitted).toLocaleString()}
        </div>
      )}
    </>
  );
}
