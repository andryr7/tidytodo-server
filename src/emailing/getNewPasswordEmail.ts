export const getNewPasswordEmail = (
  userEmail: string,
  token: string,
  clientHost: string
) => {
  return {
    from: '"TidyTodo" <tidytodo@andryratsimba.com>',
    to: userEmail,
    subject: 'TidyTodo - password reset',
    text: `Click on the following link to create a new password to your TidyTodo account: ${clientHost}/setnewpassword?token=${token}`,
    html: `
      <b>Hey there !</b>
      <br/>
      <span>Please click <b><a href="${clientHost}/setnewpassword?token=${token}">here</a></b> to create a new password for your TidyTodo account.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `
  };
};
