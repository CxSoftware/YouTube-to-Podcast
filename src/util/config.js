// Dependencies
const jsonfile = require ('jsonfile');
const path = require ('path');

// Constants
const CONFIG_PATH = path.join (__dirname, '..', '..', 'config.json');

// Module
export default jsonfile.readFileSync (CONFIG_PATH);
