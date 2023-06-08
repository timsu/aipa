import { PRODUCT } from "@/types";
import EmailBase, { BlueButton, BodyText, EmailFooter, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function WelcomeEmail() {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>Welcome to {PRODUCT}. We think you&apos;ll love it here.</BodyText>
      <BlueButton href={baseUrl + "/dashboard"}>View Dashboard</BlueButton>
      <EmailFooter />
    </EmailBase>
  );
}
