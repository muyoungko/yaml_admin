const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const yaml = require('yaml');
const { generateEntityApi } = require('./crud/api-generator');
const { generateLoginApi } = require('./crud/login-api-generator');

async function registerRoutes(app, options = {}) {
  const { yamlPath, yamlString } = options;
  let yml;
  if(yamlPath) {
    yml = await readYml(yamlPath);
  } else if(yamlString) {
    yml = yaml.parse(yamlString);
  }
  if(!yml) {
    throw new Error('yml is not found. yamlPath or yamlString is required.')
  }

  if(yml.login) {
    const {jwtSecret, idPassword} = yml.login;
  }

  const {database, entity, login} = yml;
  let db = null;
  if(database) {
    const {mongodb} = database;
    if(mongodb) {
      const {uri} = mongodb;
      db = await MongoClient.connect(uri, {}).then(client => client.db())
      console.log('db connected')
    }
  }

  entity && Object.keys(entity).forEach(async (entityName) => {
    await generateEntityApi(app, db, entityName, entity[entityName])
  })
}

async function readYml(path) {
  const yml = await fs.readFile(path, 'utf8');
  return yaml.parse(yml);

}

module.exports = registerRoutes;
