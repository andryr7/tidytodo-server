import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';

//Env variables imports
import {
  CHANGE_PASSWORD_TOKEN_SECRET,
  PASSWORD_REGEX
} from '../../utils/envVariables';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

//Setting up the password regex matching
//Password validation: 8 letters, Caps, Mins, 1 number, 1 special character (@$!%*?&)
const passwordRegex = new RegExp(PASSWORD_REGEX);

export async function setNewPassword(
  req: Request,
  res: Response
): Promise<any> {
  try {
    //Extracting the password reset token and password from the request
    const passwordResetToken = req.body.token;
    const newPassword = req.body.newPassword;

    //If the token is not present in the request
    if (!passwordResetToken) {
      return res.status(400).send('Error: bad reset password token');
    }

    //If no password was submitted in the request
    if (!newPassword || newPassword.length === 0) {
      return res.status(400).send('Error: no new password was provided');
    }

    //Checking password complexity in case of forged request
    if (!newPassword.match(passwordRegex)) {
      return res.status(400).send('Error: new password is not valid');
    }

    //Initializing a variable to store the user id extracted from the token
    let userId;

    //Verifying the token and its expiration
    try {
      const decodedPasswordResetToken = await verifyAsync(
        passwordResetToken,
        CHANGE_PASSWORD_TOKEN_SECRET
      );
      userId = decodedPasswordResetToken.userId;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(468).send('Error: password change token has expired');
      } else {
        return res
          .status(463)
          .send('Error: password change token is not valid');
      }
    }

    //Finding the corresponding user in the database
    const userToUpdate = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    //If the user hasn't been found
    if (!userToUpdate) {
      return res.status(467).send('Error: user doesnt exist');
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword
      }
    });

    if (!updatedUser) {
      res
        .status(500)
        .send(
          'An error has occured while updating the user password. Please retry later'
        );
    }

    if (updatedUser) {
      //If the user has been correctly updated with a new password
      return res
        .status(200)
        .send('User password has been successfully changed.');
    }
  } catch (err) {
    console.log(err);
  }
}
