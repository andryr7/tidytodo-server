import { CLIENT_HOST_URL, EMAIL_REPLY_ADRESS } from '../utils/envVariables';

export const getNewPasswordEmail = (userEmail: string, token: string) => {
  return {
    from: `"TidyTodo" <${EMAIL_REPLY_ADRESS}>`,
    to: userEmail,
    subject: 'TidyTodo - password reset',
    text: `Click on the following link to create a new password to your TidyTodo account: ${CLIENT_HOST_URL}/setnewpassword?token=${token} This link will stop working in exactly one day.`,
    html: `
      <b>Hey there !</b>
      <br/>
      <span>Please click <b><a href="${CLIENT_HOST_URL}/setnewpassword?token=${token}">here</a></b> to create a new password for your TidyTodo account. This link will stop working in exactly one day.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `
  };
};
