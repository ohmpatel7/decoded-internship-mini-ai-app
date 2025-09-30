// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Optional: log to confirm env was read
console.log('Has API key?', !!process.env.OPENAI_API_KEY);

// Create OpenAI client if API key exists
let client = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('✅ OpenAI client initialised');
} else {
  console.warn('⚠️  No OPENAI_API_KEY set – using fallback extractor.');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mini-ai-app-backend' });
});

// Root message
app.get('/', (req, res) => {
  res.send('Mini AI App backend is running. Try GET /health or POST /extract.');
});

// Extract
app.post('/extract', async (req, res) => {
  const description = (req.body && req.body.description) || '';

  // Use AI if client configured
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
        features: Array.isArray(parsed.features) ? parsed.features : [],
        source: 'ai'
      });
    } catch (e) {
      console.error('OpenAI extraction failed:', e.message);
      // fall through to fallback
    }
  }

  // Fallback (works even without API key)
  res.json({
    appName: 'Course Manager',
    entities: ['Student', 'Course', 'Grade'],
    roles: ['Teacher', 'Student', 'Admin'],
    features: ['Submit Homework', 'View Grades', 'Manage Assignments'],
    source: 'fallback'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log('Has API key?', !!process.env.OPENAI_API_KEY);
});
