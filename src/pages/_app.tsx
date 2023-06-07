import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";

import { SessionProvider } from "next-auth/react";
import { Noto_Sans } from "next/font/google";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";

const noto = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <main className={noto.className}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}

// debugging shortcut
global.window?.window.addEventListener("keydown", function (event) {
  if (event.key == "F6") {
    debugger;
  }
});
