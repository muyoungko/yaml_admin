const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function parseYML(yamlTextOrBuffer) {
  if (yamlTextOrBuffer == null) {
    throw new Error('parseYML: yamlTextOrBuffer is required');
  }
  const yamlText = Buffer.isBuffer(yamlTextOrBuffer)
    ? yamlTextOrBuffer.toString('utf8')
    : String(yamlTextOrBuffer);
  try {
    const parsed = yaml.load(yamlText);
    if (parsed == null || typeof parsed !== 'object') {
      throw new Error('YAML did not produce an object');
    }
    return parsed;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    const wrapped = new Error(`Failed to parse YAML: ${message}`);
    wrapped.cause = err;
    throw wrapped;
  }
}

function parseYMLFile(filePath, encoding = 'utf8') {
  if (!filePath) {
    throw new Error('parseYMLFile: filePath is required');
  }
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, { encoding });
  return parseYML(content);
}

module.exports = { parseYML, parseYMLFile }; 