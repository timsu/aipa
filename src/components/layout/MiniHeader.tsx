import { useSession } from "next-auth/react";
import { PropsWithChildren } from "react";

export default function MiniHeader({ children }: PropsWithChildren<{}>) {
  const session = useSession();

  return (
    <header>
      <div className={"p-2 relative flex justify-center"}>
        <div className="px-4 w-full max-w-4xl mx-auto">{children}</div>
        {session?.data?.user && <div className="absolute right-2">{session.data.user.email}</div>}
      </div>
    </header>
  );
}
