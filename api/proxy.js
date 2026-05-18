module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, imageBase64 } = req.body;
    const parts = [];
    if (imageBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: prompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );
    const data = await response.json();

    if (data.error) return res.status(400).json({ error: data.error.message });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(400).json({ error: 'Respuesta vacía de Gemini: ' + JSON.stringify(data) });

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
