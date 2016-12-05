require ('babel-polyfill');
// Runtime

// Dependencies
const jsonfile = require ('jsonfile');
const path = require ('path');
const winston = require ('winston');

// Get paths
const CONFIG_PATH = path.join (__dirname, '..', 'config.json');
const LOG_PATH = path.join (__dirname, '..', 'service.log');

// Configure log
winston.add (winston.transports.File, { filename: LOG_PATH });

(async () =>
{
	try
	{
		// Load configuration file
		const config = jsonfile.readFileSync (CONFIG_PATH);
		winston.log ('info', 'Hello world!');
		winston.log ('info', 'Config', config);
	}
	catch (e)
	{
		winston.log ('error', e);
	}
})();
