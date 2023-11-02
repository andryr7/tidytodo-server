import { Secret } from 'jsonwebtoken';

//Application server variables
export const HOST_PORT: string = process.env.HOST_PORT!;

//Access and refresh token variables
export const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRATION: string =
  process.env.ACCESS_TOKEN_EXPIRATION!;
export const REFRESH_TOKEN_MAX_COUNT: number = parseInt(
  process.env.REFRESH_TOKEN_MAX_COUNT!
);
export const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET!;
export const REFRESH_TOKEN_EXPIRATION: string =
  process.env.REFRESH_TOKEN_EXPIRATION!;
//Email verification variables
export const VERIFY_EMAIL_TOKEN_SECRET: Secret =
  process.env.VERIFY_EMAIL_TOKEN_SECRET!;
export const VERIFY_EMAIL_TOKEN_EXPIRATION: string =
  process.env.ACCESS_TOKEN_EXPIRATION!;
//Password resetting variables
export const CHANGE_PASSWORD_TOKEN_SECRET: Secret =
  process.env.CHANGE_PASSWORD_TOKEN_SECRET!;
export const CHANGE_PASSWORD_TOKEN_EXPIRATION: string =
  process.env.CHANGE_PASSWORD_TOKEN_EXPIRATION!;
//Email changing variables
export const CHANGE_EMAIL_TOKEN_SECRET: Secret =
  process.env.CHANGE_EMAIL_TOKEN_SECRET!;
export const CHANGE_EMAIL_TOKEN_EXPIRATION: string =
  process.env.CHANGE_EMAIL_TOKEN_EXPIRATION!;

//Password variables
export const PASSWORD_REGEX: string = process.env.PASSWORD_REGEX!;

//Hosting variables
export const CLIENT_HOST_URL: string = process.env.CLIENT_HOST_URL!;
