export const cookieAccessToken = async (res, token) => {
  res.cookie('token', token.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};
