export const getActivationEmail = (
  userEmail: string,
  token: string,
  clientHost: string
) => {
  return {
    from: '"TidyTodo" <tidytodo@andryratsimba.com>',
    to: userEmail,
    subject: 'TidyTodo - activate your account',
    text: `Welcome to TidyTodo ! Please visit the following link to verify your e-mail address and activate your account: ${clientHost}/verifyuser?token=${token}. This link will stop working in exactly one day.`,
    html: `
      <b>Welcome to TidyTodo !</b>
      <br/>
      <span>Please click <b><a href="${clientHost}/verifyuser?token=${token}">here</a></b> to verify your e-mail address and activate your account. This link will stop working in exactly one day.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `
  };
};
