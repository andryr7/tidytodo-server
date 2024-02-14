import { CLIENT_HOST_URL, EMAIL_REPLY_ADRESS } from '../utils/envVariables';

export const getActivationEmail = (userEmail: string, token: string) => {
  return {
    from: `"TidyTodo" <${EMAIL_REPLY_ADRESS}>`,
    to: userEmail,
    subject: 'TidyTodo - activate your account',
    text: `Welcome to TidyTodo ! Please visit the following link to verify your e-mail address and activate your account: ${CLIENT_HOST_URL}/verifyuser?token=${token}. This link will stop working in exactly one day.`,
    html: `
      <b>Welcome to TidyTodo !</b>
      <br/>
      <span>Please click <b><a href="${CLIENT_HOST_URL}/verifyuser?token=${token}">here</a></b> to verify your e-mail address and activate your account. This link will stop working in exactly one day.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `
  };
};
