// Dependencies
const path = require ('path');
const winston = require ('winston');

// Get paths
const LOG_PATH = path.join (__dirname, '..', '..', 'service.log');

// Configure log
winston.add (winston.transports.File, { filename: LOG_PATH });
