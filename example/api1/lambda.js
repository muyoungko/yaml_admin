'use strict';
const serverless = require('serverless-http');

exports.handler = async (event, context) => {
    const app = await require('./app');
    const handler = serverless(app);
    return await handler(event, context);
};
