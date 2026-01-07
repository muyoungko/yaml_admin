const member = require('../member/member.js');

const generateLoginApi = async(app, db, yml, prefix) => {
    console.log('generateLoginApi', yml.login["jwt-secret"])
    await member(app, db, yml, prefix)
}

module.exports = {
    generateLoginApi
}