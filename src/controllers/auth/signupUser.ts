import * as EmailValidator from 'email-validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
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

export async function signupUser(req: Request, res: Response): Promise<any> {
  //Checking if name, email and password are present in request
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).send('something is missing');
  }

  //Checking if user name is long enough (at lease one character)
  if (req.body.name.length === 0) {
    return res.status(400).send('Error: name is not valid');
  }

  //Checking if email is valid
  if (!EmailValidator.validate(req.body.email)) {
    return res.status(400).send('Error: email is not valid');
  }

  //Checking password complexity in case of forged request
  if (!req.body.password.match(passwordRegex)) {
    return res.status(400).send('Error: chosen password is not valid');
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      }
    });

    if (newUser) {
      //If the user has been correctly created

      //Create the verify token
      const verifyUserToken = jwt.sign(
        { userId: newUser.id },
        VERIFY_EMAIL_TOKEN_SECRET,
        { expiresIn: VERIFY_EMAIL_TOKEN_EXPIRATION }
      );

      //Generating the email
      const verificationEmail = getVerificationEmail(
        newUser.email,
        verifyUserToken,
        CLIENT_HOST_URL
      );

      //Preparing and sending the activation e-mail
      const info = await transporter.sendMail(verificationEmail);

      return res
        .status(200)
        .send(
          'User has been successfully created. An e-mail has been sent to the provided adress.'
        );
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        console.log(e);
        return res.status(409).send('Email is not unique');
      } else {
        return res.status(500).send('Unknown error');
      }
    } else {
      res.status(500).send();
      throw e;
    }
  }
}
