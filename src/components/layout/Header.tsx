import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession();

  if (!session)
    return (
      <header>
        <div className="sm:h-10"></div>
      </header>
    );

  return (
    <header>
      <div className={"bg-slate-100 p-2 flex print:hidden"}>
        <div className="w-12 hidden md:block" />
        {session?.user && (
          <>
            <nav className="flex-1 max-w-4xl mx-auto">
              <ul className="flex items-center h-8">
                <li>
                  <Link className={"hover:bg-slate-200 p-3"} href="/dashboard">
                    Home
                  </Link>
                </li>
              </ul>
            </nav>
            {session.user.image && (
              <span
                style={{ backgroundImage: `url('${session.user.image}')` }}
                className="w-8 h-8 bg-cover rounded-full inline-block mr-2"
              />
            )}
            {/* <a
              href={`/api/auth/signout`}
              className={"hover:underline"}
              onClick={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign out
            </a> */}
          </>
        )}
      </div>
    </header>
  );
}
