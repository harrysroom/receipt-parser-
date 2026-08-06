export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing in environment variables.' });
  }

  const prompt = `Extract receipt details from this image and respond strictly in valid JSON format matching this exact structure:
{
  "vendor_name": "Store Name",
  "transaction_date": "YYYY-MM-DD",
  "tax_amount": 0.00,
  "total_amount": 0.00
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
