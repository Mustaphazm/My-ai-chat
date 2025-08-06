export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, category } = req.body;
    
    // Prepend category to message for context
    const formattedMessage = `[${category}] ${message}`;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: formattedMessage })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const aiResponse = data[0].generated_text;
        
        // Remove the user's input from the response
        const cleanResponse = aiResponse.replace(formattedMessage, '').trim();
        
        res.status(200).json({ response: cleanResponse });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
}
