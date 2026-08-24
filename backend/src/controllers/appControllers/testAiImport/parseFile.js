const getClient = require('./geminiClient');
const extractDocText = require('./extractDocText');

// The AI's ONLY job is splitting the document into questions/options and
// preserving their text as-is — it never decides what's correct. Deciding
// correctness from formatting cues is slow and unreliable for a model; "*"
// detection is a one-line string check, so it's done deterministically in
// JS after extraction (see markCorrectAnswers below), not asked of the AI.
const SYSTEM_INSTRUCTION = `Siz test hujjatlarini strukturaga ajratuvchi yordamchisiz. Sizga o'qituvchi tayyorlagan .docx fayldan olingan HTML matn beriladi.

Vazifangiz FAQAT: matnni savollarga va har bir savolning javob variantlariga ajratish, matnni O'ZGARTIRMASDAN. Quyidagi JSON formatida javob qaytaring:

{
  "title": "Testning taxminiy sarlavhasi",
  "questions": [
    {
      "prompt": "Savol matni (boshidagi '1.', '2)' kabi raqamlashsiz)",
      "options": ["variant matni, o'zgartirmasdan (masalan '*A) 12' yoki 'A) 12 *')", "..."]
    }
  ]
}

QOIDALAR:
- Variant matnini AYNAN qandayligicha qoldiring — "*" belgisi bo'lsa ham, shu holicha yozing, uni olib tashlamang yoki tahlil qilmang.
- Agar savolda variantlar umuman bo'lmasa (ochiq savol) — "options" bo'sh massiv bo'lsin.
- Hech qanday to'g'ri javobni ANIQLASHGA URINMANG — bu sizning vazifangiz emas.
- Faqat JSON qaytaring, boshqa hech qanday matn qo'shmang.`;

// Deterministic: an option is correct iff its extracted text contains "*",
// anywhere in the string (teachers place it before, inside, or after the
// option). The marker itself is stripped from the text shown to the admin.
const markCorrectAnswers = (rawQuestions) => {
  return rawQuestions.map((q) => {
    const rawOptions = Array.isArray(q.options) ? q.options : [];

    if (rawOptions.length === 0) {
      return {
        prompt: q.prompt,
        questionType: 'open_response',
        options: [],
        correctAnswerText: '',
        points: 1,
      };
    }

    const options = rawOptions.map((text) => {
      const isCorrect = text.includes('*');
      return { text: text.replace(/\*/g, '').trim(), isCorrect };
    });

    const correctCount = options.filter((o) => o.isCorrect).length;

    return {
      prompt: q.prompt,
      questionType: correctCount > 1 ? 'multi_choice' : 'single_choice',
      options,
      points: 1,
    };
  });
};

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

  const questions = markCorrectAnswers(parsed.questions);

  return res.status(200).json({
    success: true,
    result: { title: parsed.title, questions },
    message: `${questions.length} ta savol topildi.`,
  });
};

module.exports = parseFile;
