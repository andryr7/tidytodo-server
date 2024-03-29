import { CLIENT_HOST_URL, EMAIL_REPLY_ADRESS } from '../utils/envVariables';

export const getEmailChangeEmail = (userEmail: string, token: string) => {
  return {
    from: `"TidyTodo" <${EMAIL_REPLY_ADRESS}>`,
    to: userEmail,
    subject: 'TidyTodo - verify this new e-mail address',
    text: `Click on the following link to verify this new e-mail address for your TidyTodo account: ${CLIENT_HOST_URL}/confirmemail?token=${token} . This link will stop working in exactly one day.`, // plain text body
    html: `
      <b>Hey there !</b>
      <br/>
      <span>Please click <b><a href="${CLIENT_HOST_URL}/confirmemail?token=${token}">here</a></b> to verify this new e-mail address for your TidyTodo account. This link will stop working in exactly one day.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `
  };
};
