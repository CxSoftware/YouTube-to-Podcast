// Runtime
require ('babel-polyfill');
require ('./util/log');

// Dependencies
const winston = require ('winston');

// Local
const config = require ('./util/config');

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
