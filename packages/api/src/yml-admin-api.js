const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const yaml = require('yaml');
const { generateEntityApi } = require('./crud/entity-api-generator');
const { generateLoginApi } = require('./crud/login-api-generator');
const { withConfig } = require('./login/auth.js');
const { generateUploadApi } = require('./upload/upload-api-generator');

async function registerRoutes(app, options = {}) {
  const { yamlPath, yamlString } = options;
  let yml;
  if(yamlPath) {
    yml = await readYml(yamlPath);
  } else if(yamlString) {
    yml = yaml.parse(yamlString);
  } else {
    let yamlString = await fs.readFile('./admin.yml', 'utf8');
    if(!yamlString) {
      throw new Error('admin.yml is not found. yamlPath or yamlString is required.')
    }
    yamlString = yamlString.replace('${JWT_SECRET}', process.env.JWT_SECRET);
    yamlString = yamlString.replace('${MONGODB_URL}', process.env.MONGODB_URL);
    yml = yaml.parse(yamlString);
  }

  const {database, entity} = yml;
  let db = null;
  if(database) {
    const {mongodb} = database;
    if(mongodb) {
      const {uri} = mongodb;
      db = await MongoClient.connect(uri, {}).then(client => client.db())
      console.log('db connected')
    }
  }

  await generateLoginApi(app, db, yml)
  entity && Object.keys(entity).forEach(async (entity_name) => {
    await generateEntityApi({
      app, db, 
      entity_name, 
      entity:entity[entity_name], 
      yml,
      options,
    })
  })

  await generateUploadApi({
    app, db,
    yml,
    options,
  })
  
  //local secure download api
  const auth = withConfig({ db, jwt_secret: yml.login["jwt-secret"] });
  app.get('/local-secure-download', auth.isAuthenticated, async (req, res) => {
    const {key} = req.query;
    const a = `${yml.upload.local.path_private}/${key}`
    const file = await fs.readFile(a)
    res.setHeader('Content-Disposition', `attachment; filename=${key}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(file);
  })
}

async function readYml(path) {
  let yml = await fs.readFile(path, 'utf8');
  yml = yml.replace('${JWT_SECRET}', process.env.JWT_SECRET);
  yml = yml.replace('${MONGODB_URL}', process.env.MONGODB_URL);
    
  return yaml.parse(yml);

}

module.exports = registerRoutes;
