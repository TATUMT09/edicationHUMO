export const CORRECT_MESSAGES = [
  "🔥 Zo'r! Davom et, chempion!",
  "💪 Mashaallah, aynan shunday!",
  "🎯 To'g'ri! Sen kuchli ekansan!",
  '⚡ Ajoyib javob!',
  "✅ Aynan shu! Shunday davom et.",
  '🚀 Zo`r ketyapsan, to`xtama!',
  '🏆 Otangga rahmat, xolos!',
  '🌟 Mukammal! Yana bittasi kutmoqda.',
];

export const INCORRECT_MESSAGES = [
  "😅 Bo'lmadi, lekin harakat yaxshi — yana urin!",
  "🤔 Deyarli to'g'ri, keyingisida albatta!",
  "📚 Xato bo'ldi, lekin xato — bilimning yarmi!",
  '😬 Ehh, ozgina adashding.',
  "🔄 Bo'lmadi, lekin taslim bo'lma!",
  "💡 Hafa bo'lma, keyingisida tuzataman de!",
  "🙈 Yo'q, unaqa emas — yana bir bor o'yla!",
  '🎢 Har kim xato qiladi, davom et!',
];

const PERFECT_MESSAGES = [
  "🏆 100%! Sen haqiqiy chempionsan!",
  '👑 Mukammal natija — ajoyibsan!',
  "🔥 Xatosiz! Bundan zo'r bo'lmaydi!",
];
const GREAT_MESSAGES = [
  "💪 Zo'r natija, shunday davom et!",
  '🚀 Yaxshi ishlading, oldinga!',
  "🌟 Ajoyib, sen o'sib borayapsan!",
];
const OK_MESSAGES = [
  "📚 Yomon emas, lekin yaxshilash mumkin — davom et!",
  '🔄 Yana mashq qil, natija yaxshilanadi!',
  "💡 Har bir urinish — bilimga bir qadam!",
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const randomCorrectMessage = () => pickRandom(CORRECT_MESSAGES);
export const randomIncorrectMessage = () => pickRandom(INCORRECT_MESSAGES);

export const randomScoreMessage = (scorePercent) => {
  if (scorePercent === 100) return pickRandom(PERFECT_MESSAGES);
  if (scorePercent >= 70) return pickRandom(GREAT_MESSAGES);
  return pickRandom(OK_MESSAGES);
};
