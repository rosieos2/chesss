// Display AI thoughts
async function displayAIThought(move) {
    const terminal = document.getElementById('thought-terminal');
    
    try {
        const response = await fetch('/api/claude', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ move })
        });
        
        const data = await response.json();
        
        // Add new thought with typing effect
        const thought = document.createElement('div');
        thought.style.marginBottom = '10px';
        terminal.appendChild(thought);
        
        let i = 0;
        const text = `> ${data.thought}`;
        const typeEffect = setInterval(() => {
            if (i < text.length) {
                thought.textContent += text.charAt(i);
                i++;
                terminal.scrollTop = terminal.scrollHeight;
            } else {
                clearInterval(typeEffect);
            }
        }, 20);
        
        // Keep only last 5 thoughts
        while (terminal.children.length > 5) {
            terminal.removeChild(terminal.firstChild);
        }
    } catch (error) {
        console.error('Error getting AI thought:', error);
    }
}