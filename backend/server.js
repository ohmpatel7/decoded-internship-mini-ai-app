// backend/server.js (top)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Loaded .env from:', path.join(__dirname, '.env'));
console.log('Has API key (dotenv)?', !!process.env.OPENAI_API_KEY);

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Only create the OpenAI client if we actually have a key.
// This prevents the "Missing credentials" crash.
let client = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('✅ OpenAI client initialised');
} else {
  console.warn('⚠️  No OPENAI_API_KEY set – using fallback extractor.');
}

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mini-ai-app-backend' });
});

// Root message
app.get('/', (req, res) => {
  res.send('Mini AI App backend is running. Try GET /health or POST /extract.');
});

// Extract requirements (AI if key present; otherwise fallback)
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
        response_format: { type: 'json_object' }
      });

      const text = completion.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);

      return res.json({
        appName: parsed.appName || 'Untitled App',
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        roles: Array.isArray(parsed.roles) ? parsed.roles : [],
        features: Array.isArray(parsed.features) ? parsed.features : []
      });
    } catch (e) {
      console.error('OpenAI extraction failed:', e.message);
      // fall through to fallback below
    }
  }

  // Fallback demo data (works with no key, or API error)
  res.json({
    appName: 'Course Manager',
    entities: ['Student', 'Course', 'Grade'],
    roles: ['Teacher', 'Student', 'Admin'],
    features: ['Add course', 'Enroll students', 'View reports'],
    note: 'fallback (no API key / API error)'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log('Has API key?', !!process.env.OPENAI_API_KEY);
});
