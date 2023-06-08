import EmailBase, { BlueButton, BodyText, EmailFooter, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

type Props = {
  fromUser: string;
  title: string;
  path: string;
};

export default function ResponseReceived({
  fromUser = "Tim",
  title = "SAFE Note",
  path = "/forms/responses/1",
}: Props) {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>
        {fromUser} just responded to your <b>{title}</b> request.
      </BodyText>
      <BlueButton href={baseUrl + path}>View response</BlueButton>
      <EmailFooter />
    </EmailBase>
  );
}
