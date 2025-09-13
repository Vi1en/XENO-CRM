// Load environment variables from root .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
