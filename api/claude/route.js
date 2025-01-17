import { Configuration, OpenAIApi } from 'openai';

export const runtime = 'edge'; // Use Edge Runtime

export async function POST(req) {
    try {
        const { move } = await req.json();

        // API call to Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                max_tokens: 150,
                messages: [{
                    role: "user",
                    content: `The player just moved their piece to ${move}. Make a witty, taunting response about their move.`
                }],
                system: "You are a sarcastic, taunting chess AI. You love to mock your opponent's moves in a playful way. Keep responses short and witty. Don't be cruel - keep it fun and playful."
            })
        });

        const data = await response.json();

        return new Response(JSON.stringify({ 
            thought: data.content[0].text 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to process request' 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}