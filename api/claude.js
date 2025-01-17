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
      // Log the incoming request
      console.log('API Request received:', req.body);
  
      const { move } = req.body;
      
      // Validate move exists
      if (!move) {
        return res.status(400).json({ error: 'Move parameter is required' });
      }
  
      // For testing, return a mock response first
      return res.status(200).json({ 
        thought: `Testing: You moved to ${move}... interesting choice!` 
      });
  
      /* Commenting out Claude API call for now
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 150,
          messages: [{
            role: "user",
            content: `The player just moved their piece to ${move}. Make a witty, taunting response about their move.`
          }]
        })
      });
  
      const data = await claudeResponse.json();
      return res.status(200).json({ thought: data.content[0].text });
      */
  
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
