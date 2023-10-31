export const getVerificationEmail = (userEmail: string, token: string, clientHost: string) => {
  return {
    from: '"TidyTodo" <tidytodo@andryratsimba.com>', // sender address
    to: userEmail, // list of receivers
    subject: "Hello there !", // Subject line
    text: `Welcome to TidyTodo ! Please visit the following link to activate your account: ${clientHost}/verifyuser?token=${token}`, // plain text body
    //TODO Replace with production hostname
    html: `
      <b>Welcome to TidyTodo !</b>
      <br/>
      <span>Please click <b><a href="${clientHost}/verifyuser?token=${token}">here</a></b> to activate your account.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `, // html body
  }
}