import * as EmailValidator from 'email-validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import prisma from '../../db/prismaClient';
import ms from 'ms';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

//Env variables imports
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_MAX_COUNT,
  VERIFY_EMAIL_TOKEN_SECRET,
  VERIFY_EMAIL_TOKEN_EXPIRATION,
  CHANGE_PASSWORD_TOKEN_SECRET,
  CHANGE_PASSWORD_TOKEN_EXPIRATION,
  CHANGE_EMAIL_TOKEN_SECRET,
  CLIENT_HOST_URL,
  PASSWORD_REGEX
} from '../../utils/envVariables';

//Emailing imports
import { transporter } from '../../emailing/transporter';
import { getVerificationEmail } from '../../emailing/getVerificationEmail';
import { getNewPasswordEmail } from '../../emailing/getNewPasswordEmail';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

//Setting up the password regex matching
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

export async function sendNewUserEmailVerificationEmail(
  req: Request,
  res: Response
): Promise<any> {
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
    if (user.isVerified) {
      return res
        .status(465)
        .send('Error: user email has already been verified');
    }

    //User was found => checking the passowrd
    if (await bcrypt.compare(req.body.password, user.password)) {
      //Password is correct

      //Create the verify token
      const verifyUserToken = jwt.sign(
        { userId: user.id },
        VERIFY_EMAIL_TOKEN_SECRET,
        { expiresIn: VERIFY_EMAIL_TOKEN_EXPIRATION }
      );

      //Generating the email
      const verificationEmail = getVerificationEmail(
        user.email,
        verifyUserToken,
        CLIENT_HOST_URL
      );

      //Preparing and sending the activation e-mail
      const info = await transporter.sendMail(verificationEmail);

      res
        .status(200)
        .send(
          'A new verification e-mail has been sent to the provided adress.'
        );
    } else {
      return res.status(401).send('Error: email or password is incorrect');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

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

export async function setNewPassword(
  req: Request,
  res: Response
): Promise<any> {
  try {
    //Extracting the password reset token from the request
    const passwordResetToken = req.body.token;

    //If the token is note present in the request
    if (!passwordResetToken) {
      return res.status(400).send('Error: bad reset password token');
    }

    //Initializing a variable to store the user id extracted from the token
    let userId;

    //Checking password complexity in case of forged request
    if (!req.body.newPassword || !req.body.newPassword.match(passwordRegex)) {
      return res.status(400).send('Error: password is not valid');
    }

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
