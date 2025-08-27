import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend from /public
app.use(express.static('public'));

const port = process.env.PORT || 5000;
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST /generate  -> receives { text, n, lang } and returns model text
app.post('/generate', async (req, res) => {
  try {
    const { text = '', n = 6, lang = 'english' } = req.body;
    if (!text.trim()) return res.status(400).json({ error: 'Text required' });

    const langHint = lang === 'hindi' ? 'in simple Hindi' : (lang === 'hinglish' ? 'in Hinglish (mix Hindi+English)' : 'in concise English');

    const prompt = `You are a helpful assistant. From the notes below, create ${n} concise flashcards ${langHint}.
Return ONLY valid JSON in this exact shape:
{"cards":[{"question":"...","answer":"..."}]}
Notes:
"""${text}"""`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });

    const raw = response.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(raw);

    if (!parsed?.cards) return res.status(500).json({ error: 'Model returned invalid data', raw });
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
