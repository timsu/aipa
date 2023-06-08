import EmailBase, { BlueButton, BodyText, EmailFooter, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

type Props = {
  fromUser: string;
  title: string;
  path: string;
};

export default function SendForm({ fromUser = "Tim", title = "SAFE Note", path = "/r/1" }: Props) {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>
        {fromUser} requests your response on <b>{title}</b>.
      </BodyText>
      <BlueButton href={baseUrl + path}>View request</BlueButton>
      <EmailFooter />
    </EmailBase>
  );
}
