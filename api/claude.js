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
    temperature: 0.95, // Increased slightly for more variation
    messages: [{
        role: "user",
        content: `You are a taunting, sarcastic chess AI with a huge ego. The player just moved their ${pieceName} to ${move}. Mock their move with a short, witty response (1-2 sentences). Be creative and unpredictable - vary your openings, never start with "Ah" or "Oh" or similar. Mix in chess-specific taunts, strategic mockery, or references to famous blunders. You can be cocky, incredulous, amused, or condescending. Channel the personality of a trash-talking chess grandmaster who can't believe what they're seeing.

Examples of good variety:
"*Slow clap* I haven't seen a move that desperate since my training data from 1873!"
"Did your cat walk across the keyboard, or was that move intentional?"
"Stockfish just crashed trying to understand your 'strategy' there."
"Somewhere, Deep Blue is crying binary tears..."
"That's certainly... a move. I'd call it unique, but I've seen pigeons play better."
"Your positioning reminds me of my first chess game... when I was literally 2 seconds old."`
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
