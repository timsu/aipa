import Link from "next/link";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Finished() {
  return (
    <div className="flex flex-col items-center">
      <CheckCircleIcon className="text-green-500 w-20 h-20 my-20" />

      <h1 className="text-3xl text-center font-bold mb-20">Thank you for filling out the form!</h1>
      <div className="mb-4">
        If you need to edit your answers later, you can always re-open this link.
      </div>
      <div className="">
        Did you like this experience?{" "}
        <Link href="/" className="underline">
          Sign up for DocGet today!
        </Link>
      </div>
    </div>
  );
}
