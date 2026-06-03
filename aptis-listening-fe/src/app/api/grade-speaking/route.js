import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const questionText = formData.get('questionText');
    const partNum = parseInt(formData.get('partNum') || '1');
    const sampleAnswer = formData.get('sampleAnswer') || '';

    // Extract Groq API Key from header or environment variable
    const groqApiKey = req.headers.get('x-groq-api-key') || process.env.GROQ_API_KEY;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    if (!groqApiKey) {
      return NextResponse.json({
        error: 'Groq API Key is missing. Please configure it in the Speaking Practice Settings (⚙️).'
      }, { status: 400 });
    }

    // 1. Transcribe audio using Groq Whisper API
    const sttFormData = new FormData();
    sttFormData.append('file', file, 'recording.wav');
    sttFormData.append('model', 'whisper-large-v3');
    sttFormData.append('language', 'en');
    sttFormData.append('response_format', 'json');

    const sttResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: sttFormData
    });

    if (!sttResponse.ok) {
      const errorData = await sttResponse.json().catch(() => ({}));
      console.error('Groq STT Error:', errorData);
      throw new Error(errorData.error?.message || `STT Transcription failed with status ${sttResponse.status}`);
    }

    const sttResult = await sttResponse.json();
    const transcript = sttResult.text;

    if (!transcript || transcript.trim() === '') {
      return NextResponse.json({
        error: 'Could not transcribe any speech. Please make sure you are speaking clearly and your microphone is working.'
      }, { status: 400 });
    }

    const systemPrompt = `You are an official Aptis Speaking Examiner. Evaluate the candidate's response to the given question based on the official British Council Aptis Speaking assessment guidelines.
 
 Here is the context of the question:
 - Speaking Test Part: Part ${partNum}
 - Question: "${questionText}"
 ${sampleAnswer ? `- Sample/Reference Answer: "${sampleAnswer}"` : ''}
 
 APTIS SPEAKING TARGET CEFR LEVEL PER PART:
 - Part 1: Targets A1 - A2. A perfect answer using clean, simple language will generally achieve a maximum of B1/B2.
 - Part 2: Targets A2 - B1. Excellent answers can reach B2.
 - Part 3: Targets B1 - B2. Excellent answers can reach B2 or C.
 - Part 4: Targets B2 - C.
 
 ASSESSMENT CRITERIA (each scale is 0 to 5 points):
 1. Grammatical Range and Accuracy (0-5):
    - 5 (C level): Uses a wide range of complex structures accurately. Very few minor errors.
    - 4 (B2 level): Uses combination of simple and complex structures. Errors do not hinder communication.
    - 3 (B1 level): Uses simple structures accurately, attempts some complex structures with errors.
    - 2 (A2 level): Basic control of simple structures. Frequent errors.
    - 1/0 (A1 level): Limited to memorized formulas or isolated words.
 
 2. Vocabulary Range and Accuracy (0-5):
    - 5 (C level): Extensive vocabulary, appropriate collocations, precise word choices.
    - 4 (B2 level): Good range of vocabulary to discuss topics, with some minor inappropriate choices.
    - 3 (B1 level): Sufficient vocabulary for everyday topics, but limited variety.
    - 2 (A2 level): Basic vocabulary for personal/simple information.
    - 1/0 (A1 level): Isolated words or very basic terms.
 
 3. Pronunciation and Fluency (0-5):
    - 5 (C level): Smooth flow with natural rhythm and intonation. Little to no speech hesitation. Easy to understand.
    - 4 (B2 level): Speaks at length with some hesitation but maintains flow. Good pronunciation with minor slips.
    - 3 (B1 level): Speak in complete sentences but has noticeable hesitations and pauses while searching for words. Clear pronunciation overall.
    - 2 (A2 level): Short sentences, frequent pauses and reformulations. Listener may need to strain to understand.
    - 1/0 (A1 level): Fragmented speech, extremely slow, pronunciation is heavily distorted.
 
 4. Cohesion (0-5):
    - 5 (C level): Seamless use of a variety of linking words and cohesive devices to structure the response.
    - 4 (B2 level): Good use of transition words (e.g., 'however', 'moreover', 'on the other hand') and connectors.
    - 3 (B1 level): Uses basic connectors (e.g., 'and', 'but', 'because') to link ideas.
    - 2 (A2 level): Very limited connectors; ideas are presented in a list-like fashion.
    - 1/0 (A1 level): No linking words.
 
 5. Task Fulfilment / Topic Relevance (0-5):
    - 5 (C level): Fully and thoroughly addresses all aspects of the prompt.
    - 4 (B2 level): Addresses the main parts of the question clearly and stays fully on topic.
    - 3 (B1 level): Addresses the question but may omit some details or keep the answer brief.
    - 2 (A2 level): Partially answers the question, but struggles to stay on topic.
    - 1/0 (A1 level): Irrelevant or fails to address the question.
 
 CRITICAL GRADING INSTRUCTIONS:
 - The candidate's response should be compared to the provided Sample/Reference Answer (if available). If the candidate's transcript matches the sample answer well (accounting for Whisper transcription phonetic glitches of Vietnamese words like "Bánh mì" transcribed as "pho mi", etc.), you should score them highly (4/5 or 5/5 in Grammar, Vocab, and Cohesion), and evaluate their CEFR level based on the quality of that sample answer.
 - Note: Many sample answers for Part 1 are designed to be simple for A2/B1 students. If the candidate reads a Part 1 sample answer perfectly, award them a solid B1 or B2 level as it meets/exceeds the Part 1 target level.
 - Use the following strict CEFR mapping logic based on the sum of all 5 scores (Max: 25 points):
   * "C" level: Total score 22 - 25 points.
   * "B2" level: Total score 18 - 21 points.
   * "B1" level: Total score 13 - 17 points.
   * "A2" level: Total score 8 - 12 points.
   * "A1" level: Total score 0 - 7 points.
 
 Your response MUST be in JSON format. Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Return only the raw JSON. The JSON structure must match this schema exactly:
 {
   "scores": {
     "grammar": number,
     "vocabulary": number,
     "pronunciation_fluency": number,
     "cohesion": number,
     "task_fulfilment": number
   },
   "overall_cefr": "A1" | "A2" | "B1" | "B2" | "C",
   "transcription": "The candidate's transcribed speech",
   "strengths": "Strengths of the response in Vietnamese",
   "weaknesses": "Areas to improve (grammar/word errors) in Vietnamese. If the response is already excellent or matches the sample, keep this positive or constructive.",
   "suggestions": "Specific advice on how to improve this response in Vietnamese",
   "better_version": "An improved version of the candidate's answer in English that achieves a C level, keeping the candidate's original ideas but refining the grammar, vocabulary, and cohesion"
 }`;

    const llmResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Candidate's Response: "${transcript}"` }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json().catch(() => ({}));
      console.error('Groq LLM Error:', errorData);
      throw new Error(errorData.error?.message || `Grading failed with status ${llmResponse.status}`);
    }

    const llmResult = await llmResponse.json();
    let evaluationText = llmResult.choices[0]?.message?.content || '{}';

    // Clean up potential markdown code block wrappers
    evaluationText = evaluationText.trim();
    if (evaluationText.startsWith('```json')) {
      evaluationText = evaluationText.substring(7);
    } else if (evaluationText.startsWith('```')) {
      evaluationText = evaluationText.substring(3);
    }
    if (evaluationText.endsWith('```')) {
      evaluationText = evaluationText.substring(0, evaluationText.length - 3);
    }
    evaluationText = evaluationText.trim();

    try {
      const evaluationJSON = JSON.parse(evaluationText);
      
      // Calculate overall CEFR level deterministically based on total score of individual criteria
      const scores = evaluationJSON.scores || {};
      const grammar = Number(scores.grammar || 0);
      const vocabulary = Number(scores.vocabulary || 0);
      const pronunciation_fluency = Number(scores.pronunciation_fluency || 0);
      const cohesion = Number(scores.cohesion || 0);
      const task_fulfilment = Number(scores.task_fulfilment || 0);
      
      const totalScore = grammar + vocabulary + pronunciation_fluency + cohesion + task_fulfilment;
      
      let overallCefr = 'A1';
      if (totalScore >= 22) {
        overallCefr = 'C';
      } else if (totalScore >= 18) {
        overallCefr = 'B2';
      } else if (totalScore >= 13) {
        overallCefr = 'B1';
      } else if (totalScore >= 8) {
        overallCefr = 'A2';
      } else {
        overallCefr = 'A1';
      }
      
      evaluationJSON.overall_cefr = overallCefr;
      // Ensure transcription matches Groq STT output
      evaluationJSON.transcription = transcript;
      return NextResponse.json(evaluationJSON);
    } catch (parseError) {
      console.error('Error parsing AI response:', evaluationText, parseError);
      return NextResponse.json({
        error: 'Failed to parse AI response. Here is the raw transcription: ' + transcript,
        raw_response: evaluationText,
        transcription: transcript
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Grading Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
