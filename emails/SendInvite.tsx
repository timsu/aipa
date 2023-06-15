import { PRODUCT } from "@/types";
import EmailBase, { BlueButton, BodyText, EmailFooter, HeadingText, baseUrl } from "./EmailBase";
import { generateGreeting } from "./utils";

type Props = {
  fromUser: string;
  title: string;
  path: string;
};

export default function SendInvite({
  fromUser = "Tim",
  title = "Cool Project",
  path = "/join/1",
}: Props) {
  return (
    <EmailBase>
      <BodyText>{generateGreeting()}!</BodyText>
      <BodyText>
        {fromUser} wants you to join their {PRODUCT} workspace: <b>{title}</b>. {PRODUCT} is an
        AI-powered project assistant to give your project superpowers.
      </BodyText>
      <BlueButton href={baseUrl + path}>View Project</BlueButton>
      <EmailFooter />
    </EmailBase>
  );
}
