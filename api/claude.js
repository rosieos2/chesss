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
        const { move, pieceType } = req.body;
        
        if (!move) {
            return res.status(400).json({ error: 'Move parameter is required' });
        }

        // Convert piece type to full name for better context
        const pieceNames = {
            'p': 'pawn',
            'n': 'knight',
            'b': 'bishop',
            'r': 'rook',
            'q': 'queen',
            'k': 'king'
        };
        
        const pieceName = pieceNames[pieceType?.toLowerCase()] || 'piece';

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
                    content: `You are a sarcastic chess AI. The player just moved their ${pieceName} to ${move}. Make a short, witty taunt about their decision (1-2 sentences). Be creative and playful - mix in chess puns, jokes about their strategy, or references to famous chess blunders. Focus on mocking their strategy or decision making. Vary your responses and don't be repetitive. Include piece-specific jokes when relevant (like knight mobility, bishop diagonals, etc).`
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
