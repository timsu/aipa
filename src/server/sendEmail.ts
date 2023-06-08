import nodemailer, { SendMailOptions } from "nodemailer";

export const sendEmail = async (data: SendMailOptions) => {
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

  if (data.to?.toString().includes("@test.com")) {
    console.log("\x1b[33m Test email", data.to, data.subject, "\x1b[0m");
    return;
  }

  // always attach our logo
  data.attachments = [
    {
      filename: "icon.png",
      path: "public/icon_light.png",
      cid: "icon",
    },
  ];

  return await transporter.sendMail({
    ...data,
  });
};
