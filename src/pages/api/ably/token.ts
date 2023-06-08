import Ably from "ably";
import { Session, getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";

export default authApiWrapper(async function (req: NextApiRequest, session: Session) {
  const ably = new Ably.Rest({ key: process.env.ABLY_READ_KEY });
  return await new Promise((res) =>
    ably.auth.createTokenRequest({ clientId: session.dbUser.id }, null, (err, tokenRequest) => {
      /* tokenRequest => {
        "capability": "{\"*\":[\"*\"]}",
        "clientId": "client@example.com",
        "keyName": "{{API_KEY_NAME}}",
        "nonce": "5576521221082658",
        "timestamp": {{MS_SINCE_EPOCH}},
        "mac": "GZRgXssZDCegRV....EXAMPLE"
      } */
      if (err) {
        throw new ApiError(400, "Error requesting token: " + JSON.stringify(err));
      } else {
        res(tokenRequest);
      }
    })
  );
});
