import { render } from "@react-email/render";
import WelcomeEmail from "../../emails/WelcomeEmail";
import { sendEmail } from "@/server/sendEmail";
import { logger } from "@/lib/logger";
import VerifyEmail from "@/VerifyEmail";
import { PRODUCT } from "@/types";
import SendInvite from "@/SendInvite";

const TAG = "[emails]";

class Emails {
  fromEmail = process.env.EMAIL_FROM;
  defaultName = process.env.NODE_ENV == "development" ? `${PRODUCT} (dev)` : PRODUCT;

  formatFrom = (from: string) => {
    return `${from} <${this.fromEmail}>`;
  };

  defaultFrom = this.formatFrom(this.defaultName);

  async sendWelcome(email: string) {
    this.logEmail("sendWelcome", email);

    await sendEmail({
      to: email,
      from: this.defaultFrom,
      subject: "Welcome to " + PRODUCT,
      html: render(WelcomeEmail()),
    });
  }

  async verifyEmail(email: string, url: string) {
    this.logEmail("verifyEmail", email);

    await sendEmail({
      to: email,
      from: this.defaultFrom,
      subject: "Sign in to " + PRODUCT,
      html: render(VerifyEmail({ url })),
    });
  }

  async sendInvite(
    email: string,
    fromUser: string,
    fromEmail: string,
    title: string,
    path: string
  ) {
    this.logEmail("sendInvite", email, fromUser, title, path);

    const props = {
      fromUser,
      title,
      path,
    };
    await sendEmail({
      to: email,
      from: this.formatFrom(fromUser),
      replyTo: fromEmail,
      subject: `Please join ${title} on ${PRODUCT}`,
      html: render(SendInvite(props)),
    });
  }

  logEmail = async (type: string, ...props: any[]) => {
    if (process.env.NODE_ENV == "production") return;
    logger.info("\x1b[33m", TAG, type, ...props, "\x1b[0m");
  };
}

const emails = new Emails();
export default emails;
