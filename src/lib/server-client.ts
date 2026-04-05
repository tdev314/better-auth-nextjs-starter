import { auth } from "@/lib/auth";
import { createAuthClient } from "better-auth/client";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client"
import type { Auth } from "better-auth";

export const serverClient = createAuthClient({
  plugins: [
    oauthProviderResourceClient(auth as unknown as Auth)
  ],
});