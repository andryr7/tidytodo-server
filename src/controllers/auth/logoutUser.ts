import { Response } from 'express';
import prisma from '../../db/prismaClient';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

export async function logoutUser(
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

  //Deleting the refreshToken from DB
  try {
    await prisma.refreshToken.deleteMany({
      where: { token: userRefreshToken }
    });
    res.status(200).send('User has been logged out');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: server error');
  }
}
