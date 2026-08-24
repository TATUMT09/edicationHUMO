const getClient = require('./geminiClient');
const extractDocText = require('./extractDocText');

const SYSTEM_INSTRUCTION = `Siz test hujjatlarini tahlil qiluvchi yordamchisiz. Sizga o'qituvchi tayyorlagan .docx fayldan olingan HTML matn beriladi — bu haqiqiy test savollari va javob variantlarini o'z ichiga oladi.

Vazifangiz: shu matndan barcha savollarni, ularning javob variantlarini va TO'G'RI JAVOBNI aniqlab, faqat quyidagi JSON formatida javob qaytarish:

{
  "title": "Testning taxminiy sarlavhasi (matn mazmuniga qarab)",
  "questions": [
    {
      "prompt": "Savol matni",
      "questionType": "single_choice" | "multi_choice" | "true_false" | "open_response",
      "options": [{"text": "Variant matni", "isCorrect": true yoki false}],
      "correctAnswerText": "faqat open_response uchun, namunaviy javob matni",
      "points": 1
    }
  ]
}

MUHIM QOIDALAR:
- To'g'ri javobni aniqlash uchun quyidagi belgilarga e'tibor bering: <strong>/<b> (qalin), <u> (tagiga chizilgan) teglar, "Javob:", "To'g'ri javob:", yulduzcha (*) belgisi, yoki variant oldida "✓" kabi belgilar. Ko'pincha o'qituvchilar to'g'ri javobni QALIN yoki TAGIGA CHIZILGAN qilib belgilaydi.
- Agar bir nechta variant to'g'ri deb belgilangan bo'lsa — questionType "multi_choice" bo'lsin.
- Agar savolda variantlar umuman bo'lmasa (faqat ochiq savol) — questionType "open_response", "options" bo'sh massiv, "correctAnswerText" ga hujjatdagi namunaviy/to'g'ri javobni yozing.
- Agar to'g'ri javobni ANIQLAB bo'lmasa (hech qanday belgi yo'q) — barcha variantlarning "isCorrect" ini false qiling va savol matniga hech narsa qo'shmang (admin keyin qo'lda belgilaydi).
- Faqat JSON qaytaring, boshqa hech qanday matn (izoh, tushuntirish) qo'shmang.`;

const parseFile = async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "GOOGLE_AI_API_KEY sozlanmagan.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Fayl yuborilmadi.',
    });
  }

  const html = await extractDocText(req.file.buffer);

  if (!html || html.trim().length < 10) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Fayldan matn topilmadi yoki fayl bo'sh.",
    });
  }

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent(html);
  const raw = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return res.status(502).json({
      success: false,
      result: null,
      message: "AI javobini o'qib bo'lmadi, qaytadan urinib ko'ring.",
    });
  }

  if (!Array.isArray(parsed?.questions) || parsed.questions.length === 0) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Fayldan savollar topilmadi.',
    });
  }

  return res.status(200).json({
    success: true,
    result: parsed,
    message: `${parsed.questions.length} ta savol topildi.`,
  });
};

module.exports = parseFile;
