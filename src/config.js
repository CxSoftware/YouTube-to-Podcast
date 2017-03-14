// Dependencies
const jsonfile = require ('jsonfile');
const path = require ('path');

// Constants
const CONFIG_PATH = path.join (__dirname, '..', 'config.json');

// Module
module.exports = jsonfile.readFileSync (CONFIG_PATH);
