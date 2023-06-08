import EmailBase, { BlueButton, BodyText, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function WelcomeEmail() {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>Welcome to Rhea. We think you&apos;ll love it here.</BodyText>
      <BlueButton href={baseUrl + "/dashboard"}>View Dashboard</BlueButton>
      <BodyText>Cheers,</BodyText>
      <BodyText>The Rhea Team</BodyText>
    </EmailBase>
  );
}
