import { Response } from 'express';
import prisma from '../../db/prismaClient';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');

export async function logoutUserEverywhereElse(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  //Extracting the token from the request
  const userRefreshToken = req.body.refreshToken;

  //Check if refresh token is present
  //TODO add input validation
  if (!userRefreshToken) {
    return res.status(401).send('Error: no refresh token was provided');
  }

  try {
    //Deleting all user refresh token in DB except the one used to submit the request
    await prisma.refreshToken.deleteMany({
      where: {
        userId: req.userId,
        token: {
          not: userRefreshToken
        }
      }
    });

    res
      .status(200)
      .send('User has been logged out from everywhere except this device');
  } catch (error: any) {
    res.status(500).send('Error: server error');
  }
}
