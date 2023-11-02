import { NextFunction, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload, Secret } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../customTypes/AuthenticatedRequest';
import { ACCESS_TOKEN_SECRET } from '../utils/envVariables';

//Promisifies version of jwt verify
//TODO Convert to ES import
const util = require('util');
const verifyAsync = util.promisify(jwt.verify);

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];

  if (token == null) {
    return res.status(401).send('Error: no access token was provided');
  }

  try {
    const decodedToken = await verifyAsync(token, ACCESS_TOKEN_SECRET);
    req.userId = decodedToken.userId;
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(457).send('Error: access token has expired');
    } else {
      return res.status(458).send('Error: access token is not valid');
    }
  }
}
