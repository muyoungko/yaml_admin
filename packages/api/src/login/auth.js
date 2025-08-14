const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const request = require('request');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { OAuth2Client } = require('google-auth-library');
const DapiService = require('../dapi/DapiService.js');

var cryptPassword = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err)
      return callback(err);

    bcrypt.hash(password, salt, function (err, hash) {
      return callback(err, hash);
    });
  });
};

var comparePassword = function (plainPass, hashword, callback) {
  bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
    return err == null ?
      callback(null, isPasswordMatch) :
      callback(err);
  });
};

var authenticateSuccess = async (req, res, user, next) => {
  const {jwt_secret} = await DapiService.getProjectConfig(req.projectKey)
  const cd = config.cookieDomain;
  const cookieOptionHttpOnly = { maxAge: 100000000000, httpOnly: true };
  const cookieOptionNormal = { maxAge: 100000000000, httpOnly: false };
  if (cd != '*') {
    cookieOptionHttpOnly['domain'] = config.cookieDomain;
    cookieOptionNormal['domain'] = config.cookieDomain;
  }

  delete user.password;
  if (!user.email)
    user.email = '';

  jwt.sign(
    user,
    jwt_secret,
    {
      expiresIn: '1000d',
      issuer: cd,
      subject: 'userInfo'
    }, (err, token) => {
      if (err) res.json({ r: false, msg: '알 수 없는 이유로 토큰 생성에 실패하였습니다.' });
      res.cookie('token', token, cookieOptionNormal);

      //volley 에서 Set-Cookie를 하나이상 못받아드리므로 오류
      // res.cookie('name', user.name, cookieOptionNormal);
      // res.cookie('member_no', user.member_no, cookieOptionNormal);
      req.token = token;
      req.user = user;
      next();
    }
  );
};

const canAuthenticated = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token || req.cookies.token;
  if (token == null)
    next();
  else {
    const {jwt_secret} = await DapiService.getProjectConfig(req.projectKey)
    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
        next();
      }
      req.user = decoded;
      delete req.user.password;
      next();
    })
  }
};

const isMasterAuthenticated = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token || req.cookies.token;
  if (token == null)
    res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
  else {
    const jwt_secret = "298374sjndasdfkjhasjf3" //Devil-App-Buider 토큰
    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
        res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
        return;
      }
      req.user = decoded;
      delete req.user.password;
      next();
    })
  }
}

const isAuthenticated = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token || req.cookies.token;
  if (token == null)
    res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
  else {
    const {jwt_secret} = await DapiService.getProjectConfig(req.projectKey)
    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
        res.json({ r: false, err: { code: 666 }, msg: '로그인 필요' });
        return;
      }
      req.user = decoded;
      delete req.user.password;
      next();
    })
  }
};

const getMemberFromReq = async (req, callback) => {
  const token = req.headers['x-access-token'] || req.query.token;
  if (token == null)
    callback(null);
  else {
    const {jwt_secret} = await DapiService.getProjectConfig(req.projectKey)
    jwt.verify(token, jwt_secret, (err, decoded) => {
      callback(decoded);
    })
  }
}

var isAdminAuthenticated = function (req, res, next) {
  const adminKey = req.query.adminKey;
  if(adminKey == 'a26bcd4a3ce3f3e3'){
    next();
  } else {
    res.json({r:false, err:{code:666} , msg:'Admin Key 필요'});
  }
};

const init = async function (app) {

  app.use(cookieSession({
    keys: ['auth'],
    cookie: {
      path: '/', httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 * 24// 유효기간 한달
    }
  }));
};



const authenticate = async (req, res, next) => {
  const db = await DapiService.getProjectDb(req.projectKey)
  const email = req.query.email || req.body.email;
  const password = req.query.pass || req.body.password || req.body.pass;
  const type = req.query.type || req.body.type || "email";

  const memberProjection = { projection: { _id: false, name: true, member_no: true, email: true, type: true, password: true, profile: true } };
  if (type === 'email') {
    memberProjection['password'] = true;
    let member = await db.collection('member').findOne({ type: type, identifier: email }, memberProjection)

    if (member != null) {
      comparePassword(password, member.password, function (err, isPasswordMatch) {
        if (isPasswordMatch)
          authenticateSuccess(req, res, member, next);
        else
          res.json({ r: false, msg: '비밀번호가 일치하지 않습니다.' });
      });
    }
    else
      res.json({ r: false, msg: '존재하지 않는 사용자입니다.' });
  }
};

module.exports = {
  init,
  authenticate,
  cryptPassword,
  comparePassword,
  isAuthenticated,
  isMasterAuthenticated,
  getMemberFromReq,
  canAuthenticated,
  isAdminAuthenticated,
  authenticateSuccess,
}