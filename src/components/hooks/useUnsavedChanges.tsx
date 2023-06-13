import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useUnsavedChanges() {
  // prompt the user if they try and leave with unsaved changes
  // from https://stackoverflow.com/questions/63664479/detect-when-a-user-leaves-page-in-next-js
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!unsavedChanges) return;

    console.log("adding ze hook");
    const warningText = "You have unsaved changes - are you sure you wish to leave this page?";
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (!unsavedChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [unsavedChanges, router.events]);

  return [unsavedChanges, setUnsavedChanges] as const;
}
