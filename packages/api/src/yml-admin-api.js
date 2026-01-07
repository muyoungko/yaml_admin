const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const yaml = require('yaml');
const { generateEntityApi } = require('./crud/entity-api-generator');
const { generateLoginApi } = require('./crud/login-api-generator');
const { generateChartApi } = require('./crud/chart-api-generator');
const { withConfig } = require('./login/auth.js');
const { generateUploadApi } = require('./upload/upload-api-generator');

const changeEnv = (yamlString, env = {}) => {
  if (!yamlString) return yamlString;
  const mergedEnv = { ...process.env, ...env };
  return yamlString.replace(/\$\{([A-Z0-9_\.\-]+)\}/g, (match, varName) => {
    console.log('env', varName, mergedEnv[varName]);
    const value = mergedEnv[varName];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

async function registerRoutes(app, options = {}) {
  const { yamlPath, yamlString, env, yamlJson } = options;
  let yml;

  if(yamlJson) {
    yml = yamlJson;
  } else if(yamlPath) {
    yml = await readYml(yamlPath, env);
  } else if(yamlString) {
    const replaced = changeEnv(yamlString, env);
    yml = yaml.parse(replaced);
  } else {
    let yamlString = await fs.readFile('./admin.yml', 'utf8');
    if(!yamlString) {
      throw new Error('admin.yml is not found. yamlPath or yamlString is required.')
    }
    
    yamlString = changeEnv(yamlString, env);

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
  await generateChartApi(app, db, yml)
  
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

async function readYml(path, env = {}) {
  let yml = await fs.readFile(path, 'utf8');
  yml = changeEnv(yml, env);
  return yaml.parse(yml);
}

module.exports = registerRoutes;
