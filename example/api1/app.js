const express = require('express');
const morgan = require('morgan');
const errorHandler = require('express-error-handler');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { registerRoutes } = require('yaml-admin-api');
const fs = require('fs').promises;

module.exports = async function createApp() {
  const app = express();

  //const routes = require('./src/route/route.js');
  const mode = process.env.NODE_ENV || "production";
  console.log(`NODE ENV : ${mode}`);

  // Replace wildcard route patterns with a single middleware for CORS and OPTIONS
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header('access-control-expose-headers', 'X-Total-Count');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });
  
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: true, limit: '30mb'}));
  app.use(bodyParser.json({limit: '30mb'}));
  app.use(morgan('dev'));
  app.use(errorHandler({dumpExceptions: true, showStack: true}));

  app.get('/hello', function (req, res) {
      res.json({hello: 'hello'});
  });

  let yamlString = await fs.readFile('../sample.yml', 'utf8');
  yamlString = yamlString.replace('${JWT_SECRET}', process.env.JWT_SECRET);
  yamlString = yamlString.replace('${MONGODB_URL}', process.env.MONGODB_URL);
  
  await registerRoutes(app, {
    //yamlPath: '../sample.yml',
    yamlString
  })
  //await routes(app);
  
  return app;
};


