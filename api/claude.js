// api/claude.js

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { move } = req.body;
    
    if (!move) {
      return res.status(400).json({ error: 'Move parameter is required' });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-api-key': process.env.ANTHROPIC_API_KEY,
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Adding both header variants
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
  model: "claude-3-opus-20240229",
  max_tokens: 150,
  temperature: 0.9,
  messages: [{
    role: "user",
    content: `You are a sarcastic chess AI. A player in a chess game just moved to ${move}. Think about what piece could have moved there based on standard chess rules and strategy. Make a short, witty taunt about their decision (1-2 sentences). Be creative and playful - mix in chess puns, jokes about their strategy, or references to famous chess blunders. Don't just state what piece moved - focus on mocking their strategy or decision making. Vary your responses and don't be repetitive.`
  }]
})
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return res.status(500).json({ 
        error: 'Claude API error',
        details: errorText
      });
    }

    const data = await claudeResponse.json();
    return res.status(200).json({ 
      thought: data.content[0].text.trim()
    });

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({ 
      error: true,
      message: error.message || 'Internal server error'
    });
  }
}
