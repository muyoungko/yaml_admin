const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const withConfig = (config) => {
  const { db, jwt_secret, passwordEncoding, master_email, master_password } = config;
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

  const authenticate = async (req, res, next) => {
    const email = req.query.email || req.body.email;
    const password = req.query.pass || req.body.pass;
    const type = req.query.type || req.body.type || "email";
    if (master_email && master_password && email === master_email && password === master_password) {
      authenticateSuccess(req, res,
        { id: '1111111', email: 'master', name: 'master', type: 'email' },
        next);
    }
    else {
      const memberProjection = { projection: { _id: false, name: true, email: true, password: true, super: true, id: true } };
      if (type === 'email') {
        memberProjection['password'] = true;
        let member = await db.collection('admin').findOne({ email: email }, memberProjection)
        if (member != null) {
          let isPasswordMatch = await comparePassword(password, member.password)
          if (isPasswordMatch) {
            await db.collection('admin').updateOne({ email: email }, { $set: { login_date: new Date() } }, { upsert: false })
            delete member.password;
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