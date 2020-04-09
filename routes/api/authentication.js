const router = require('express').Router();
const User = require('../../models/User');
const passport = require('passport');
const mailer = require('../../modules/mailer');
const genPass = require('generate-password');

router.get('', async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id).populate(['department']);

    if (!user)
      res.sendStatus(401);

    return res.json({ user: user.toAuthJSON() });
  } catch(err) {
    return next(err);
  }
  
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body.user;

  if (!email)
    return res.status(422).json({ errors: { message: "E-mail não pode ser vazio" } });

  if (!password)
    return res.status(422).json({ errors: { message: "Senha não pode ser vazia" } });

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err)
      return next(err);

    if (user) {
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

// register a new user
router.post('/register', async (req, res, next) => {
  try {
    const user = new User(req.body.user);
    const { key } = req.body;

    if (key !== 'oparin')
      return res.status(403).json({ errors: {
        message: 'Operação não permitida'
      }});

    if (req.body.user.department && req.body.department.id)
      user.department = await Department.findById(req.body.department.id).populate(['manager','childOf']);
    else
      user.department = undefined;

    const password = user.getRandomPassword(6)

    user.setPassword(password);

    await user.save();

    mailer.sendMail({
      to: user.email,
      from: 'ti@canex.com.br',
      template: 'new_user',
      context: { password },
    }, (err) => {
      if (err) {
        return res.json({
          user: user.toCrudJSON(),
          errors: {
            message: 'E-mail inicial não foi enviado ao usuário'
          }
        });
      }

      return res.json({ user: user.toCrudJSON() });
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/forgot_password', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).populate(['department']);

    if (!user)
      return res.status(404).json({
        errors: {
          message: "E-mail não encontrado"
        }
      });
    if (user.inactive) {
      return res.status(403).json({
        errors: {
          message: "Usuário não tem autorização para acessar o sistema"
        }
      });
    }

    const token = genPass.generate({length: 6, symbols: false, uppercase: false, numbers: true});

    const expires = new Date();
    expires.setTime(expires.getTime() + (3600000));

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;

    user.save();

    mailer.sendMail({
      to: email,
      from: 'ti@canex.com.br',
      template: 'forgot_password',
      context: { token }
    }, (err) => {
      if (err) {
        return res.json({
          errors: {
            message: '"Esqueceu sua senha" não enviado ao usuário'
          }
        });
      }

      return res.status(200).json({ok: 'ok'});
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate(['department']);

    if (!user)
      return res.status(404).json({
        errors: {
          message: "E-mail não encontrado"
        }
      });

    if (token !== user.passwordResetToken)
      return res.status(401).json({
        errors: {
          message: "Token inválido"
        }
      });

      if (!password)
      return res.status(422).json({
        errors: {
          message: "Senha não pode ser vazia"
        }
      });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).json({
        errors: {
          message: "Token expirado, faça login novamente"
        }
      });

    user.setPassword(password);

    await user.save();

    return res.status(200).json({ok: 'ok'});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;