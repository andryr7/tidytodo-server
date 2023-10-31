import * as nodemailer from 'nodemailer';

//Email settings variables
export const EMAIL_HOST: string = process.env.EMAIL_HOST!;
export const EMAIL_PORT: string = process.env.EMAIL_PORT!;
export const EMAIL_USER: string = process.env.EMAIL_USER!;
export const EMAIL_PASSWORD: string = process.env.EMAIL_PASSWORD!;

//E-mail sending settings
export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT),
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});
