import { Request, Response } from 'express';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';

//Env variables imports
import {
  CHANGE_PASSWORD_TOKEN_SECRET,
  CHANGE_PASSWORD_TOKEN_EXPIRATION,
  CLIENT_HOST_URL
} from '../../utils/envVariables';

//Emailing imports
import { transporter } from '../../emailing/transporter';
import { getNewPasswordEmail } from '../../emailing/getNewPasswordEmail';

export async function sendPasswordResetEmail(
  req: Request,
  res: Response
): Promise<any> {
  if (!req.body.email) {
    return res.status(400).send('Error: email is missing');
  }

  try {
    //Searching the database for the user corresponding to the provided email
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });

    const emailSentMessage =
      'If an account linked to this email adress exists, a password reset e-mail has been sent.';

    //If the user corresponding to the provided email hasn't been found
    if (!user) {
      // return res.status(467).send('Error: user doesnt exist')
      //Sending a normal response to avoid transmitting sensitive information
      return res.status(200).send(emailSentMessage);
    }

    //If the user eamil hasn't been verified yet
    if (!user.isVerified) {
      // return res.status(466).send('Error: user email hasnt been verified')
      //Sending a normal response to avoid transmitting sensitive information
      return res.status(200).send(emailSentMessage);
    }

    //Create the verify token
    const changePasswordToken = jwt.sign(
      { userId: user.id },
      CHANGE_PASSWORD_TOKEN_SECRET,
      { expiresIn: CHANGE_PASSWORD_TOKEN_EXPIRATION }
    );

    //Generating the email
    const changePasswordEmail = getNewPasswordEmail(
      user.email,
      changePasswordToken,
      CLIENT_HOST_URL
    );

    //Preparing and sending the activation e-mail
    const info = await transporter.sendMail(changePasswordEmail);

    return res.status(200).send(emailSentMessage);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
}
