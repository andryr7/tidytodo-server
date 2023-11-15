import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../db/prismaClient';
import ms from 'ms';
import jwt from 'jsonwebtoken';
//Env variables imports
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_MAX_COUNT
} from '../../utils/envVariables';

export async function loginUser(req: Request, res: Response): Promise<any> {
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
    if (!user.isVerified) {
      return res.status(466).send("Error: user email hasn't been verified");
    }

    //User was found => checking the passowrd
    if (await bcrypt.compare(req.body.password, user.password)) {
      //Finding the tokens linked to the user
      const linkedToken = await prisma.refreshToken.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      //If the max count of tokens linked to the user is reached, delete the overflowing ones
      if (linkedToken.length >= REFRESH_TOKEN_MAX_COUNT) {
        const tokensToDelete = linkedToken.slice(REFRESH_TOKEN_MAX_COUNT - 1);

        const deleteTokenPromises = tokensToDelete.map((tokenToDelete) =>
          prisma.refreshToken.delete({
            where: {
              id: tokenToDelete.id
            }
          })
        );

        await Promise.all(deleteTokenPromises);
      }

      //Generate new access and refresh tokens
      const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION
      });
      const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRATION
      });
      const accessTokenExpiresIn = ms(ACCESS_TOKEN_EXPIRATION);
      const refreshTokenExpiresIn = ms(REFRESH_TOKEN_EXPIRATION);

      //Storing refresh token in database
      try {
        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id
          }
        });
      } catch (error) {
        console.error(error);
        return res.status(500).send('Error: server error');
      }

      return res.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresIn: accessTokenExpiresIn,
        refreshTokenExpiresIn: refreshTokenExpiresIn
      });
    } else {
      return res.status(401).send('Error: email or password is incorrect');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
