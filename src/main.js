// Runtime
require ('babel-polyfill');

// Dependencies
const path = require ('path');
const winston = require ('winston');

// Local
const config = require ('./config');

// Get paths
const LOG_PATH = path.join (__dirname, '..', 'service.log');

// Configure log
winston.add (winston.transports.File, { filename: LOG_PATH });

(async () =>
{
	try
	{
		winston.log ('info', 'Hello world!');
		winston.log ('info', 'Config', config);
	}
	catch (e)
	{
		winston.log ('error', e);
	}
})();
