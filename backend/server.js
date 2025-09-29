// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Loaded .env from:', path.join(__dirname, '.env'));
console.log('Has API key (dotenv)?', !!process.env.OPENAI_API_KEY);

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

// Allow local dev front-end ports
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
}));
app.use(express.json());

// Build client only if key exists (prevents crash)
let client = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('✅ OpenAI client initialised');
} else {
  console.warn('⚠️  No OPENAI_API_KEY set – using fallback extractor.');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mini-ai-app-backend', keyLoaded: !!process.env.OPENAI_API_KEY });
});

// Root message
app.get('/', (req, res) => {
  res.send('Mini AI App backend is running. Try GET /health or POST /extract.');
});

// Extract endpoint
app.post('/extract', async (req, res) => {
  const description = (req.body && req.body.description) || '';

  if (client) {
    try {
      const prompt = `
You are a product analyst. Extract structured app requirements from the user's description.
Return STRICT JSON with exactly these keys:
{
  "appName": string,
  "entities": string[],
  "roles": string[],
  "features": string[]
}
Guidelines: invent a short sensible appName if not given; entities are key data objects; roles are user types; features are main actions.
User description:
"""${description}"""`;

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const text = completion.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);

      return res.json({
        appName: parsed.appName || 'Untitled App',
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        roles: Array.isArray(parsed.roles) ? parsed.roles : [],
        features: Array.isArray(parsed.features) ? parsed.features : [],
        source: 'ai',
      });
    } catch (err) {
      // Log useful info for quota/invalid key errors
      console.error('OpenAI extraction failed:',
        err?.response?.data || err?.message || err);
      // fall through to fallback below
    }
  }

  // Fallback (no key or API error)
  res.json({
    appName: 'Course Manager',
    entities: ['Student', 'Course', 'Grade'],
    roles: ['Teacher', 'Student', 'Admin'],
    features: ['Add course', 'Enroll students', 'View reports'],
    note: 'fallback (no API key / API error)',
    source: 'fallback',
  });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log('Has API key?', !!process.env.OPENAI_API_KEY);
});

