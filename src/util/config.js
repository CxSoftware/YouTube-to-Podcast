// Dependencies
import jsonfile from 'jsonfile';
import path from 'path';

// Constants
const CONFIG_PATH = path.join (__dirname, '..', '..', 'config.json');

// Module
export default jsonfile.readFileSync (CONFIG_PATH);
