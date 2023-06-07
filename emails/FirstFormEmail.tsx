import EmailBase, { BlueButton, BodyText, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

export default function FirstFormEmail() {
  return (
    <EmailBase>
      <BodyText>Congrats!</BodyText>
      <BodyText>
        You filled out your first form on DocGet. If you liked that experience, why not check out
        our amazing form builder?
      </BodyText>
      <BlueButton href={baseUrl + "/dashboard?from=email"}>Visit DocGet</BlueButton>
      <BodyText>Cheers,</BodyText>
      <BodyText>The DocGet Team</BodyText>
    </EmailBase>
  );
}
