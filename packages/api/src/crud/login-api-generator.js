const member = require('../member/member.js');

const generateLoginApi = async(app, db) => {
    await member(app, db)
}

module.exports = {
    generateLoginApi
}