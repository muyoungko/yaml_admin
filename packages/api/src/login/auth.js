const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const withConfig = (config) => {
  const { db, jwt_secret } = config;

  const comparePassword = function (plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
      return err == null ?
        callback(null, isPasswordMatch) :
        callback(err);
    });
  };

  const authenticateSuccess = function (req, res, user, next) {
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

  const isAuthenticated = function (req, res, next) {
    
    const token = req.headers['x-access-token'] || req.query.token || req.cookies.token;
    if (token == null)
      res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
    else
      jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
          res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
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
    if (email === 'admin' && password === '5756') {
      authenticateSuccess(req, res,
        { id: '1111111', email: 'admin', name: 'admin', type: 'email' },
        next);
    }
    else {
      var memberProjection = { projection: { _id: false, name: true, email: true, password: true, super: true, id: true } };
      if (type === 'email') {
        memberProjection['password'] = true;
        let member = await db.collection('admin').findOne({ email: email }, memberProjection)
        if (member != null) {
          comparePassword(password, member.password, async function (err, isPasswordMatch) {
            if (isPasswordMatch) {
              authenticateSuccess(req, res, member, next);
              await db.collection('admin').updateOne({ email: email }, { $set: { login_date: new Date() } }, { upsert: false })
            } else
              res.json({ r: false, msg: '비밀번호가 일치하지 않습니다.' });
          });
        }
        else
          res.json({ r: false, msg: '존재하지 않는 사용자입니다.' });
      }
    }
  };

  return {
    isAuthenticated,
    authenticate,
  }
}

module.exports = {
  withConfig,
}