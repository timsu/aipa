import EmailBase, { BlueButton, BodyText, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function VerifyEmail({ url = "https://google.com" }: { url: string }) {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>Welcome to DocGet! Please use this link to sign in.</BodyText>
      <BlueButton href={url}>Sign in</BlueButton>
      <BodyText>Cheers,</BodyText>
      <BodyText>The DocGet Team</BodyText>
    </EmailBase>
  );
}
