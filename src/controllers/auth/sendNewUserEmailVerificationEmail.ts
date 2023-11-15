import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';

//Env variables imports
import {
  VERIFY_EMAIL_TOKEN_SECRET,
  VERIFY_EMAIL_TOKEN_EXPIRATION,
  CLIENT_HOST_URL,
  PASSWORD_REGEX
} from '../../utils/envVariables';

//Emailing imports
import { transporter } from '../../emailing/transporter';
import { getVerificationEmail } from '../../emailing/getVerificationEmail';

//Setting up the password regex matching
//Password validation: 8 letters, Caps, Mins, 1 number, 1 special character (@$!%*?&)
const passwordRegex = new RegExp(PASSWORD_REGEX);

export async function sendNewUserEmailVerificationEmail(
  req: Request,
  res: Response
): Promise<any> {
  //Checking if email and password are present in request
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Error: email or password is missing');
  }

  try {
    //Finding the user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });

    //If the user was not found
    if (user == null) {
      return res.status(401).send('Error: email or password is incorrect');
    }

    //If the user e-mail has not yet been verified
    if (user.isVerified) {
      return res
        .status(465)
        .send('Error: user email has already been verified');
    }

    //User was found => checking the passowrd
    if (await bcrypt.compare(req.body.password, user.password)) {
      //Password is correct

      //Create the verify token
      const verifyUserToken = jwt.sign(
        { userId: user.id },
        VERIFY_EMAIL_TOKEN_SECRET,
        { expiresIn: VERIFY_EMAIL_TOKEN_EXPIRATION }
      );

      //Generating the email
      const verificationEmail = getVerificationEmail(
        user.email,
        verifyUserToken,
        CLIENT_HOST_URL
      );

      //Preparing and sending the activation e-mail
      const info = await transporter.sendMail(verificationEmail);

      res
        .status(200)
        .send(
          'A new verification e-mail has been sent to the provided adress.'
        );
    } else {
      return res.status(401).send('Error: email or password is incorrect');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
