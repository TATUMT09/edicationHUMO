const crypto = require('crypto');

const CODE_TTL_MS = 10 * 60 * 1000;

const generateCode = () => {
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  const expires = new Date(Date.now() + CODE_TTL_MS);
  return { code, expires };
};

module.exports = generateCode;
