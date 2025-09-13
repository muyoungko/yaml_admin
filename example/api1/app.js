const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { registerRoutes, genEntityIdWithKey } = require('yaml-admin-api');

module.exports = async function createApp() {
  const app = express();

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
  
  const router = express.Router();
  const options = {
    listener: {
      entityCreated: async (db, entity_name, entity) => {
        console.log('entityCreated', entity_name, entity)
        if(entity_name == 'item')
          await syncLocation(db, entity)
      },
      entityDeleted: async (db, entity_name, entity) => {
        console.log('entityDeleted', entity_name, entity)
        if(entity_name == 'item')
          await db.collection('place').deleteMany({item_id: entity.id})
      }
    }
  }
  await registerRoutes(router, {yamlPath:'../admin.yml', ...options})

  app.use('/', router)
  
  return app;
};


const syncLocation = async (db, entity) => {
  const place = await db.collection('place').findOne({item_id: entity.id})
  console.log('syncLocation', place)
  if(place)
    return
  const newPlace = {
    id: await genEntityIdWithKey(db, 'place'),
    item_id: entity.id, 
    server_id: entity.server_id,
    create_date: new Date(),
    update_date: new Date(),
    create_admin_id: entity.create_admin_id,
  }
  console.log('newPlace', newPlace)
  await db.collection('place').insertOne(newPlace)
}