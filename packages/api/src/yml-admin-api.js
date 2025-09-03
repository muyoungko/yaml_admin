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
  } else {
    let yamlString = await fs.readFile('./admin.yml', 'utf8');
    if(!yamlString) {
      throw new Error('admin.yml is not found. yamlPath or yamlString is required.')
    }
    yamlString = yamlString.replace('${JWT_SECRET}', process.env.JWT_SECRET);
    yamlString = yamlString.replace('${MONGODB_URL}', process.env.MONGODB_URL);
    yml = yaml.parse(yamlString);
  }

  await generateLoginApi(yml.login)

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

  entity && Object.keys(entity).forEach(async (entityName) => {
    await generateEntityApi({
      app, db, 
      name:entityName, 
      entity:entity[entityName], 
      jwt_secret:yml.login["jwt-secret"]
    })
  })
}

async function readYml(path) {
  let yml = await fs.readFile(path, 'utf8');
  yml = yml.replace('${JWT_SECRET}', process.env.JWT_SECRET);
  yml = yml.replace('${MONGODB_URL}', process.env.MONGODB_URL);
    
  return yaml.parse(yml);

}

module.exports = registerRoutes;
