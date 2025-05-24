import { Response } from 'express';

interface Token {
  access_token: string;
}

export const cookieAccessToken = (res: Response, token: Token) => {
  res.cookie('token', token.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};
