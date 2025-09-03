const member = require('../member/member.js');

const generateLoginApi = async(app, db, yml) => {
    console.log('generateLoginApi', yml.login["jwt-secret"])
    await member(app, db, yml)
}

module.exports = {
    generateLoginApi
}