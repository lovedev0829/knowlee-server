import nodemailer from "nodemailer";

const SMTP_USERNAME = process.env.SMTP_USERNAME;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
});

export async function sendMail(sendMailOptions: nodemailer.SendMailOptions) {
    const info = await transporter.sendMail({
        from: SMTP_USERNAME,
        // to: "bhaumik.d@crestinfosystems.com",
        to: "knowlee.ai@gmail.com",
        ...sendMailOptions,
    });
    return info;
}