import { Request, Response } from 'express';
import prisma from '../../db/prismaClient';
import jwt from 'jsonwebtoken';

//Env variables imports
import { VERIFY_EMAIL_TOKEN_SECRET } from '../../utils/envVariables';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

export async function verifyUserEmail(
  req: Request,
  res: Response
): Promise<any> {
  try {
    //Extracting the verify token from the request
    const verifyToken = req.body.token;

    //Initializing a variable to store the user id extracted from the token
    let userId;

    //Verifying the token and its expiration
    try {
      const decodedVerifyToken = await verifyAsync(
        verifyToken,
        VERIFY_EMAIL_TOKEN_SECRET
      );
      userId = decodedVerifyToken.userId;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(462).send('Error: email verifying token has expired');
      } else {
        return res
          .status(463)
          .send('Error: email verifying token is not valid');
      }
    }

    //Finding the corresponding user in the database
    const userToVerify = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    //If the user hasn't been found
    if (!userToVerify) {
      return res.status(464).send('Error: user to verify doesnt exist');
    }

    //If the user has already been verified
    if (userToVerify.isVerified) {
      return res
        .status(465)
        .send('Error: user email has already been verified');
    }

    //Setting the user as verified
    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isVerified: true
      }
    });

    if (updatedUser) {
      res.status(200).send('User email has been successfully verified');
    }
  } catch (error: any) {
    res.status(500).send('Error: server error');
  }
}
