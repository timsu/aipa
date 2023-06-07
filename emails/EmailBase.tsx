import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";
import { Button } from "@react-email/button";
import { Preview } from "@react-email/preview";
import { Tailwind } from "@react-email/tailwind";
import { Head } from "@react-email/head";
import { PropsWithChildren } from "react";
import { Img } from "@react-email/img";

export const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const logo = "cid:icon";

export default function EmailBase({
  preview,
  children = <BodyText>Email Body</BodyText>,
}: PropsWithChildren<{ preview?: string }>) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Tailwind>
        <Section className="bg-white mx-auto my-auto font-sans">
          <Container className="max-w-2xl mx-auto py-12 px-4">
            <Img src={logo} width="32" height="32" alt="DocGet" />
            {children}
          </Container>
        </Section>
      </Tailwind>
    </Html>
  );
}

export function HeadingText({ children }: PropsWithChildren<{}>) {
  return <Text className="text-3xl font-extrabold text-gray-900">{children}</Text>;
}

export function BodyText({ children }: PropsWithChildren<{}>) {
  return <Text className="text-lg text-gray-700">{children}</Text>;
}

export function BlueButton({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <Button className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded" href={href}>
      {children}
    </Button>
  );
}
