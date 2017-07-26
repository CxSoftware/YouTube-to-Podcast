// Dependencies
const path = require ('path');
const winston = require ('winston');
const winstoncw = require ('winston-cloudwatch');

// Local
const config = require ('./config');

// Path
config.log.local.filename = path.join (__dirname, '..', '..', config.log.local.filename);

// Configure
// Console
winston.remove (winston.transports.Console);
if (config.log.console.enabled)
	winston.add (winston.transports.Console, config.log.console);

// Local
if (config.log.local.enabled)
	winston.add (winston.transports.File, config.log.local);

// Cloud watch
if (config.log.cloudwatch.enabled)
	winston.add (winstoncw, config.log.cloudwatch);
