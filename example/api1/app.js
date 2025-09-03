const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { registerRoutes } = require('yaml-admin-api');

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
  
  await registerRoutes(app, {yamlPath:'../admin.yml'})
  
  return app;
};


