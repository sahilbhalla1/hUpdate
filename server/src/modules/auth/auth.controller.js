const authService = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { accessToken, user, cookieOptions } =
      await authService.login(req.body);

    res.cookie('token', accessToken, cookieOptions);
    res.json({ accessToken, user });

  } catch (err) {
    next(err);
  }
};

exports.dialerLogin = async (req, res, next) => {
  try {
    const { accessToken, user, cookieOptions } =
      await authService.dialerLogin(req.body);

    res.cookie('token', accessToken, cookieOptions);
    res.json({ accessToken, user });

  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token', { path: '/hisense-ts-api/' });
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
