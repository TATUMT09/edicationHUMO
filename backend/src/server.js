require('module-alias/register');
const dns = require('dns');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Windows sometimes reports a local resolver (127.0.0.1) that nothing is
// listening on, which breaks the mongodb+srv:// DNS SRV lookup. Force a
// known-good public resolver so Atlas SRV records resolve reliably.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.DATABASE).catch((error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// On a fresh/empty database (e.g. first deploy to a new server), create the
// default admin accounts automatically so no manual `npm run setup` step is
// required. No-op if admins already exist.
const seedDefaults = require('./setup/seedDefaults');
mongoose.connection.once('open', () => {
  seedDefaults().catch((error) => {
    console.error('🚫 Failed to seed default admins:', error.message);
  });
});

const { startBot } = require('./bot/telegramBot');
startBot();

const { startScheduler } = require('./bot/scheduler');
startScheduler();

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
