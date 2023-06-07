import { render } from "@react-email/render";
import WelcomeEmail from "../../emails/WelcomeEmail";
import { sendEmail } from "@/lib/sendEmail";
import SendForm from "@/SendForm";
import ResponseReceived from "@/ResponseReceived";
import { logger } from "@/lib/logger";
import VerifyEmail from "@/VerifyEmail";
import FirstFormEmail from "@/FirstFormEmail";

const TAG = "[emails]";

class Emails {
  fromEmail = process.env.EMAIL_FROM;
  defaultName = process.env.NODE_ENV == "development" ? "DocGet (dev)" : "DocGet";

  formatFrom = (from: string) => {
    return `${from} <${this.fromEmail}>`;
  };

  defaultFrom = this.formatFrom(this.defaultName);

  async sendWelcome(email: string) {
    this.logEmail("sendWelcome", email);

    await sendEmail({
      to: email,
      from: this.defaultFrom,
      subject: "Welcome to DocGet",
      html: render(WelcomeEmail()),
    });
  }

  async sendFirstForm(email: string) {
    this.logEmail("sendFirstForm", email);

    await sendEmail({
      to: email,
      from: this.defaultFrom,
      subject: "You filled out your first form!",
      html: render(FirstFormEmail()),
    });
  }

  async verifyEmail(email: string, url: string) {
    this.logEmail("verifyEmail", email);

    await sendEmail({
      to: email,
      from: this.defaultFrom,
      subject: "Sign in to DocGet",
      html: render(VerifyEmail({ url })),
    });
  }

  async sendForm(email: string, fromUser: string, fromEmail: string, title: string, path: string) {
    this.logEmail("sendForm", email, fromUser, title, path);

    const props = {
      fromUser,
      title,
      path,
    };
    await sendEmail({
      to: email,
      from: this.formatFrom(fromUser),
      replyTo: fromEmail,
      subject: "Response Requested: " + title,
      html: render(SendForm(props)),
    });
  }

  async responseReceived(
    email: string,
    fromUser: string,
    fromEmail: string,
    title: string,
    path: string
  ) {
    this.logEmail("responseReceived", email, fromUser, title, path);

    const props = {
      fromUser,
      title,
      path,
    };
    await sendEmail({
      to: email,
      from: this.formatFrom(fromUser),
      replyTo: fromEmail,
      subject: "Response Received: " + title,
      html: render(ResponseReceived(props)),
    });
  }

  logEmail = async (type: string, ...props: any[]) => {
    if (process.env.NODE_ENV == "production") return;
    logger.info("\x1b[33m", TAG, type, ...props, "\x1b[0m");
  };
}

const emails = new Emails();
export default emails;
