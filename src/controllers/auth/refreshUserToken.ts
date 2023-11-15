import { Request, Response } from 'express';
import prisma from '../../db/prismaClient';
import ms from 'ms';
import jwt from 'jsonwebtoken';

//Env variables imports
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION
} from '../../utils/envVariables';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

export async function refreshUserToken(
  req: Request,
  res: Response
): Promise<any> {
  //Extracting the token from the request
  const userRefreshToken = req.body.refreshToken;

  //Check if refresh token is present
  //TODO add input validation
  if (!userRefreshToken) {
    return res.status(401).send('Error: no refresh token was provided');
  }

  let userId;

  //WITH REFRESH TOKEN ROTATION
  try {
    const decodedToken = await verifyAsync(
      userRefreshToken,
      ACCESS_TOKEN_SECRET
    );
    userId = decodedToken.userId;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(459).send('Error: refresh token has expired');
    } else {
      return res.status(460).send('Error: refresh token is not valid');
    }
  }

  //Checking that the user token is in the authorized tokens list
  const authorizedToken = await prisma.refreshToken.findFirst({
    where: { token: userRefreshToken }
  });

  if (!authorizedToken) {
    return res.status(403).send('Error: refresh token is not valid');
  }

  //Generating and sending new access token and expiration
  const newAccessToken = jwt.sign({ userId: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION
  });
  const newRefreshToken = jwt.sign({ userId: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION
  });
  const accessTokenExpiresIn = ms(ACCESS_TOKEN_EXPIRATION);
  const refreshTokenExpiresIn = ms(REFRESH_TOKEN_EXPIRATION);

  //Adding the new refresh token to DB
  try {
    await prisma.refreshToken.create({
      data: {
        userId: userId,
        token: newRefreshToken
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error: server error');
  }

  //Deleting the old refresh token from DB
  try {
    await prisma.refreshToken.deleteMany({
      where: { token: userRefreshToken }
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send('Error: server error');
  }

  //Sending new tokens and expirations
  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenExpiresIn: accessTokenExpiresIn,
    refreshTokenExpiresIn: refreshTokenExpiresIn
  });
}
