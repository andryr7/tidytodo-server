export const getNewPasswordEmail = (userEmail: string, token: string, clientHost: string) => {
  return {
    from: '"TidyTodo" <tidytodo@andryratsimba.com>', // sender address
    to: userEmail, // list of receivers
    subject: "Hello there !", // Subject line
    text: `Click on the following link to create a new password to your TidyTodo account: ${clientHost}/setnewpassword?token=${token}`, // plain text body
    //TODO Replace with production hostname
    html: `
      <b>Welcome to TidyTodo !</b>
      <br/>
      <span>Please click <b><a href="${clientHost}/setnewpassword?token=${token}">here</a></b> to create a new password for your TidyTodo account.</span>
      <br/>
      <span>If you don't know why you are receiving this e-mail, please ignore it</span>
    `, // html body
  }
}