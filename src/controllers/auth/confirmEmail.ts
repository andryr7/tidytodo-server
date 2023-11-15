import { Request, Response } from 'express';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';

//Env variables imports
import { CHANGE_EMAIL_TOKEN_SECRET } from '../../utils/envVariables';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

export async function confirmEmail(req: Request, res: Response): Promise<any> {
  try {
    const confirmEmailToken = req.body.token;

    if (!confirmEmailToken) {
      return res
        .status(400)
        .send('Error: no email confirmation token was received');
    }

    let userId;
    let userEmail;

    //Verifying the token and its expiration, then extracting its content
    try {
      const decodedEmailChangeToken = await verifyAsync(
        confirmEmailToken,
        CHANGE_EMAIL_TOKEN_SECRET
      );
      userId = decodedEmailChangeToken.userId;
      userEmail = decodedEmailChangeToken.userEmail;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(470).send('Error: email change token has expired');
      } else {
        return res.status(471).send('Error: email change token is not valid');
      }
    }

    const userToUpdate = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!userToUpdate) {
      return res.status(467).send('Error: User doenst exist');
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        email: userEmail
      }
    });

    if (!updatedUser) {
      res
        .status(500)
        .send(
          'An error has occured while updating the user email. Please retry later'
        );
    }

    if (updatedUser) {
      //If the user has been correctly updated with a new password
      return res.status(200).send('User email was successfully updated');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error: server error');
  }
}
