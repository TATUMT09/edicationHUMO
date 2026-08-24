const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const getClient = () => {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  return genAI;
};

module.exports = getClient;
