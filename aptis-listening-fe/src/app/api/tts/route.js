import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, voice = 'hannah' } = await req.json();

    // Extract Groq API Key from header or environment variable
    const groqApiKey = req.headers.get('x-groq-api-key') || process.env.GROQ_API_KEY;

    if (!text) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    if (!groqApiKey) {
      return NextResponse.json({
        error: 'Groq API Key is missing. Please configure it in the Settings (⚙️).'
      }, { status: 400 });
    }

    // Call Groq TTS API
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-v1-english',
        input: text,
        voice: voice,
        response_format: 'wav'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq TTS Error:', errorData);
      throw new Error(errorData.error?.message || `TTS failed with status ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('TTS Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
