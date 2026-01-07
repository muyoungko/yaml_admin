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
    api_prefix: '/api1',
    listener: {
      entityListed: async (db, entity_name, list) => {
        console.log('entityListed', entity_name, list.length)
        if(entity_name == 'region')
          await regionAddInfoLockList(db, list)
      },
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

const regionAddInfoLockList = async (db, list) => {
  const region_ids = list.map(item => item.id);
  const regions = await db.collection('region').find({ parent_id: { $in: region_ids } }).toArray();
  const region_map = {};
  for(const region of regions) {
    if(!region_map[region.parent_id]) {
      region_map[region.parent_id] = [];
    }
    region_map[region.parent_id].push(region);
  }

  const sub_region_ids = regions.map(item => item.id);
  const target_region_ids = [...new Set([...region_ids, ...sub_region_ids])];
  const items = await db.collection('item').find({ region_id: { $in: target_region_ids } }).toArray();
  const item_map = {};
  for(const item of items) {
    if(!item_map[item.region_id]) {
      item_map[item.region_id] = [];
    }
    item_map[item.region_id].push(item);
  }

  const item_ids = items.map(item => item.id);
  const places = await db.collection('place').find({ item_id: { $in: item_ids } }).toArray();
  const place_map = {};
  for(const place of places) {
    if(!place_map[place.item_id]) {
      place_map[place.item_id] = [];
    }
    place_map[place.item_id].push(place);
  }

  const place_ids = places.map(item => item.id);
  const ilss = await db.collection('ils').find({ place_id: { $in: place_ids } }).toArray();
  const ils_map = {};
  for(const ils of ilss) {
    if(!ils_map[ils.place_id]) {
      ils_map[ils.place_id] = [];
    }
    ils_map[ils.place_id].push(ils);
  }

  const ils_ids = ilss.map(item => item.id);
  const locks = await db.collection('lock').find({ ils_id: { $in: ils_ids } }).project({_id:0, server_id:0}).toArray();
  const lock_map = {};
  for(const lock of locks) {
    if(!lock_map[lock.ils_id]) {
      lock_map[lock.ils_id] = [];
    }
    lock_map[lock.ils_id].push(lock);
  }

  for(const region of list) {
    const sub_regions = region_map[region.id] || [];
    region.lock_list = [];

    const target_regions = [region, ...sub_regions];
    for(const target of target_regions) {
      const sub_items = item_map[target.id] || [];
      for(const item of sub_items) {
        const sub_places = place_map[item.id] || [];
        for(const place of sub_places) {
          const sub_ilss = ils_map[place.id] || [];
          for(const ils of sub_ilss) {
            const sub_locks = lock_map[ils.id] || [];
            region.lock_list.push(...sub_locks);
          }
        }
      }
    }

    if(region.lock_list.length > 0)
      console.log('region_lock_list', region.id, region.name, region.lock_list.length)
  }
}