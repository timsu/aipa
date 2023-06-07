import EmailBase, { BlueButton, BodyText, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function WelcomeEmail() {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>
        Welcome to DocGet. We think you&apos;ll love creating forms that don&apos;t suck.
      </BodyText>
      <BlueButton href={baseUrl + "/dashboard"}>Create a request form</BlueButton>
      <BodyText>Cheers,</BodyText>
      <BodyText>The DocGet Team</BodyText>
    </EmailBase>
  );
}
