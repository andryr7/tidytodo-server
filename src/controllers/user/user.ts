import * as EmailValidator from 'email-validator';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

//Env variables imports
import {
  CHANGE_EMAIL_TOKEN_SECRET,
  CHANGE_EMAIL_TOKEN_EXPIRATION,
  PASSWORD_REGEX
} from '../../utils/envVariables';

//Emailing imports
import { transporter } from '../../emailing/transporter';
import { getEmailChangeEmail } from '../../emailing/getEmailChangeEmail';

//Setting up the password regex matching
const passwordRegex = new RegExp(PASSWORD_REGEX);

export async function updateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  //Checking if name is valid (if its at least one character long and at most 50 characters long)
  if (
    (req.body.name && req.body.name.length === 0) ||
    (req.body.name && req.body.name.length >= 50)
  ) {
    return res.status(401).send('Error: provided user name is not valid');
  }

  //Checking if an email adress was provided and if it's valid
  if (req.body.newEmail && !EmailValidator.validate(req.body.newEmail)) {
    return res.status(400).send('Error: provided new email is not valid');
  }

  //Checking password complexity
  if (req.body.newPassword && !req.body.newPassword.match(passwordRegex)) {
    return res.status(400).send('Error: provided new password is not valid');
  }

  //Checking if the current password was submitted
  if (!req.body.currentPassword) {
    return res.status(401).send('Error: Please fill in your password');
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      }
    });

    //If the user was not found
    if (user == null) {
      return res.status(400).send('User not found');
    }

    if (user.isDemo === true) {
      return res.status(472).send('Demo account cannot be altered');
    }

    //User was found => checking password
    if (await bcrypt.compare(req.body.currentPassword, user.password)) {
      //If a new email adress was provided, send an email containing a token:
      if (req.body.newEmail) {
        //Create the email change token
        const emailChangeToken = jwt.sign(
          { userId: user.id, userEmail: req.body.newEmail },
          CHANGE_EMAIL_TOKEN_SECRET,
          { expiresIn: CHANGE_EMAIL_TOKEN_EXPIRATION }
        );

        //Generating the email
        const emailChangeEmail = getEmailChangeEmail(
          req.body.newEmail,
          emailChangeToken
        );

        //Preparing and sending the activation e-mail
        const info = await transporter.sendMail(emailChangeEmail);

        //Sending response
        return res
          .status(200)
          .send('Confirmation email was sent to the provided adress');
      }

      //If no new email adress was provided:

      //If the password is correct, prepare the update data
      const userUpdateData = {
        ...(req.body.newName !== undefined && { name: req.body.newName }),
        //Encrypting password before storing it
        ...(req.body.newPassword !== undefined && {
          password: await bcrypt.hash(req.body.newPassword, 10)
        })
      };

      //Password is correct = update info
      const updatedUser = await prisma.user.update({
        where: {
          id: req.userId
        },
        data: userUpdateData
      });

      if (!updatedUser) {
        res.status(500).send('Error: server error');
      } else {
        res.status(202).send('User was successfully updated');
      }
    } else {
      return res.status(401).send('Error: password is incorrect');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: server error');
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  //Checking if the password was submitted
  if (!req.body.password) {
    return res.status(400).send('Please fill in your password');
  }

  try {
    //Finding the user in the database
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      }
    });

    //If the user was not found
    if (user == null) {
      return res.status(400).send('Error: user not found');
    }

    if (user.isDemo === true) {
      return res.status(472).send('Demo account cannot be deleted');
    }

    //User is found => checking the passowrd
    if (await bcrypt.compare(req.body.password, user.password)) {
      const deletedUser = await prisma.user.delete({
        where: {
          id: req.userId
        }
      });

      return res.status(202).send('User deleted');
    } else {
      return res.status(401).send('Invalid password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function getUserInfo(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      }
    });

    if (!user) {
      return res.status(410).send('Error: user does not exist');
    }

    res.status(200).json({
      id: user?.id,
      name: user?.name,
      email: user?.email,
      isDemo: user?.isDemo
    });
  } catch (error: any) {
    res.status(500).send('Error: server error');
  }
}
