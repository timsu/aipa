import { ButtonHTMLAttributes, PropsWithChildren, useMemo, useState } from "react";
import Button from "../ui/Button";

export default function useSubmitButton(submitLabel = "Submitting...") {
  const [submitting, setSubmitting] = useState(false);

  const SubmitButton = useMemo(
    () =>
      function SubmitButton({
        children,
        ...rest
      }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
        return (
          <Button {...rest} disabled={submitting}>
            {submitting ? submitLabel : children}
          </Button>
        );
      },
    [submitting, submitLabel]
  );

  return { submitting, SubmitButton, setSubmitting };
}
