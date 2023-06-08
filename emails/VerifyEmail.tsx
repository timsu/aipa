import { PRODUCT } from "@/types";
import EmailBase, { BlueButton, BodyText, EmailFooter, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function VerifyEmail({ url = "https://google.com" }: { url: string }) {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>Welcome to {PRODUCT}! Please use this link to sign in.</BodyText>
      <BlueButton href={url}>Sign in</BlueButton>
      <EmailFooter />
    </EmailBase>
  );
}
