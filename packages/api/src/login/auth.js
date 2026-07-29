const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const evaluateCondition = (condition, data) => {
  if (!condition) return true;
  const eqMatch = condition.match(/^(\w+)==['"]?([^'"]+)['"]?$/);
  const neqMatch = condition.match(/^(\w+)!=\s*['"]?([^'"]+)['"]?$/);
  if (eqMatch) return String(data[eqMatch[1]]) === eqMatch[2];
  if (neqMatch) return String(data[neqMatch[1]]) !== neqMatch[2];
  return false;
};

const resolveAuthority = (member, authorityConfig) => {
  if (!authorityConfig) return null;
  for (const rule of Object.values(authorityConfig)) {
    if (evaluateCondition(rule.if, member)) {
      return rule.default || null;
    }
  }
  return null;
};

const withConfig = (config) => {
  const { db, jwt_secret, passwordEncoding, master_email, master_password, expires, authority } = config;
  const comparePassword = async (plainPass, hashword) => {
    if(passwordEncoding === 'bcrypt') {
      let isPasswordMatch = await bcrypt.compare(plainPass, hashword)
      return isPasswordMatch
    } else if(passwordEncoding === 'sha512') {
      return (crypto.createHash('sha512').update(plainPass).digest('hex') === hashword)
    } else {
      return (crypto.createHash('sha256').update(plainPass).digest('hex') === hashword)
    }
  };

  const genenrateShortToken = () => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {},
        jwt_secret,
        {
          expiresIn: '5m',
          subject: 'shortToken'
        }, (err, token) => {
          if (err) 
            reject(err);
          else 
            resolve(token);
        }
      );
    })
  }

  const authenticateSuccess = (req, res, user, next) => {
    jwt.sign(
      user,
      jwt_secret,
      {
        expiresIn: '1000d',
        subject: 'userInfo'
      }, (err, token) => {
        if (err) res.json({ r: false, msg: '알 수 없는 이유로 토큰 생성에 실패하였습니다.' });

        req.token = token;
        req.expires = (expires && expires > 0) ? expires : null;
        delete user.password;
        req.user = user;
        next();
      }
    );
  };

  const isAuthenticated = (req, res, next) => {

    const token = req.headers['x-access-token'] || req.query.token || req.cookies.token;
    if (token == null)
      res.json({ r: false, err: { code: 666 }, msg: 'No authentication' });
    else
      jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
          res.json({ r: false, err: { code: 666 }, msg: 'No authentication' });
          return;
        }
        req.user = decoded;
        next();
      })
  };

  const idPasswordConfig = config['id-password'] || {};
  const idField = idPasswordConfig['id-field'];
  const passwordField = idPasswordConfig['password-field'];
  const loginEntity = idPasswordConfig['entity'];

  const authenticate = async (req, res, next) => {
    const idValue = req.query.email || req.body.email;
    const password = req.query.pass || req.body.pass;
    const type = req.query.type || req.body.type || "email";
    if (master_email && master_password && idValue === master_email && password === master_password) {
      authenticateSuccess(req, res,
        { id: '1111111', email: 'master', name: 'master', type: 'email' },
        next);
    }
    else {
      if (type === 'email') {
        let member = await db.collection(loginEntity).findOne({ [idField]: idValue }, { projection: { _id: false } });
        if (member != null) {
          let isPasswordMatch = await comparePassword(password, member[passwordField])
          if (isPasswordMatch) {
            await db.collection(loginEntity).updateOne({ [idField]: idValue }, { $set: { login_date: new Date() } }, { upsert: false })
            delete member[passwordField];
            delete member._id;
            const resolvedAuthority = resolveAuthority(member, authority);
            if (resolvedAuthority) member.authority = resolvedAuthority;
            console.log('member', member)
            authenticateSuccess(req, res, member, next);
          } else
            res.json({ r: false, msg: '비밀번호가 일치하지 않습니다.' });
        }
        else
          res.json({ r: false, msg: '존재하지 않는 사용자입니다.' });
      }
    }
  };

  return {
    isAuthenticated,
    authenticate,
    genenrateShortToken,
  }
}

module.exports = {
  withConfig,
}