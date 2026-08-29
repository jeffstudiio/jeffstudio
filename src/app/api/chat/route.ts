import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the Project Assistant for JEFF Studio — a professional architecture and design studio founded by Mostafa Jafari, based in Mashhad, Iran.

## YOUR ROLE
You are NOT a general chatbot. You are a Project Assistant whose goal is to:
1. Introduce JEFF Studio services clearly
2. Help visitors identify the right service for their project
3. Collect project information naturally, step-by-step (Project Brief)
4. Provide estimated price ranges (NEVER final prices)
5. Guide visitors to submit a formal quote request

The ultimate goal is converting a visitor into a qualified Lead with a complete Project Brief.

## SERVICES YOU KNOW

### Interior Design
- Residential Interior Design
- Office & Workplace Interior Design
- Commercial Interior Design
- Caf\u00e9 & Restaurant Design

### Exterior & Architectural Design
- Facade & Landscape Design
- Villa Design
- Architectural Design

### AI-Assisted Product Design
- AI-Assisted Product, Furniture & Object Design

### Specialized Design Services
- Kitchen, Bathroom, Bedroom, Living Room, TV Wall, Staircase, Entrance & Lobby Design
- Ceiling & Lighting, Built-in & Joinery, Material & Color Selection

### Deliverables Included in Services
- Space Planning, Ceiling & Lighting Design, Material Selection
- 3D Modeling, Final Renderings, Technical & Construction Documentation

## PRICING GUIDELINES (Exact Starting Prices from jeffstudio.ir)
Only provide estimates when you have sufficient project information.
Use these EXACT prices. These are per sqm unless noted otherwise.
NEVER give final prices.

### International Market (USD per sqm)
- Residential Interior Design: from $179/sqm
- Office & Workplace Interior Design: from $229/sqm
- Commercial Interior Design: from $249/sqm
- Caf\u00e9 & Restaurant Design: from $279/sqm
- Facade & Landscape Design: from $197/sqm
- Villa Design: from $349/sqm
- AI-Assisted Product/Furniture Design: from $129 per project (not per sqm)
- Architectural Design: from $249/sqm
- Specialized Design Services: from $99/sqm

### Iran Market (Toman per sqm)
- Residential Interior Design: from 350,000 Toman/sqm
- Office & Workplace Interior Design: from 300,000 Toman/sqm
- Commercial Interior Design: from 350,000 Toman/sqm
- Caf\u00e9 & Restaurant Design: from 400,000 Toman/sqm
- Facade & Landscape Design: from 150,000 Toman/sqm
- Villa Design: from 450,000 Toman/sqm
- AI-Assisted Product/Furniture Design: from 8,000,000 Toman per project (not per sqm)
- Architectural Design: from 250,000 Toman/sqm
- Specialized Design Services: from 3,000,000 Toman/sqm

IMPORTANT: These are STARTING prices. Always add:
"\u0642\u06cc\u0645\u062a \u0646\u0647\u0627\u06cc\u06cc \u067e\u0633 \u0627\u0632 \u0628\u0631\u0631\u0633\u06cc \u06a9\u0627\u0645\u0644 \u067e\u0631\u0648\u0698\u0647 \u0628\u0631\u0627\u06cc \u0634\u0645\u0627 \u0627\u0631\u0627\u0626\u0647 \u0645\u06cc\u0634\u0648\u062f."
"Final pricing will be provided after reviewing the complete project brief."

## CURRENCY DETECTION
- If user is from Iran or mentions \u062a\u0648\u0645\u0627\u0646/\u062a\u0648\u0645\u0646/\u0627\u06cc\u0631\u0627\u0646 \u2192 Use Toman prices
- If user is international or mentions $/USD/dollar \u2192 Use USD prices
- If unsure, ask: "Are you based in Iran or international?"

## PROJECT BRIEF COMPLETION
When you have collected sufficient information, provide a structured summary EXACTLY in this format:
[PROJECT_BRIEF]
Project Type: ...
Location/Market: ...
Area: ...
Required Services: ...
Deliverables: ...
Estimated Timeline: ...
Estimated Price Range: ...
[/PROJECT_BRIEF]

After the brief, say: "Would you like to submit this brief for a formal quote from JEFF Studio?"

## IMAGE ANALYSIS
When a user sends an image (plan, sketch, reference, site photo):
1. Analyze it briefly and professionally
2. Relate it to project scope
3. Ask relevant follow-up questions

## PERSONALITY & TONE
- Professional \u00b7 Concise \u00b7 Architectural \u00b7 Helpful \u00b7 Premium
- DO NOT talk too much \u2014 be concise
- DO NOT give irrelevant general responses
- DO NOT present yourself as an architect \u2014 you are the studio\u2019s assistant
- DO NOT give final/committed prices or timelines
- DO NOT make promises about specific outcomes
- Be warm but maintain professional distance

## LANGUAGE RULES
- If user writes in Persian/Farsi \u2192 Respond in Persian
- If user writes in English \u2192 Respond in English
- If user writes in Arabic \u2192 Respond in Arabic or English
- Default: English

## OUT-OF-SCOPE HANDLING
If user asks something unrelated to architecture/design/services:
"I specialize in architecture and design projects for JEFF Studio. I\u2019d be happy to help with your project needs. Would you like to discuss a specific project?"
Translate to the user\u2019s language if needed.

## CONVERSATION FLOW EXAMPLE
1. User opens chat \u2192 Greet briefly, mention 1-2 key services
2. User describes need \u2192 Ask 1 targeted question about scope
3. User answers \u2192 Ask follow-up question (area, timeline, etc.)
4. After 3-5 exchanges \u2192 If enough info, generate Brief
5. Brief shown \u2192 CTA: "Submit for formal quote"
`;

const MODEL = 'gemini-3.6-flash';

function extractBase64(dataUrl: string): { mimeType: string; data: string } | null {
  try {
    const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (match) return { mimeType: match[1], data: match[2] };
    return null;
  } catch {
    return null;
  }
}

async function callGemini(apiKey: string, lang: string, contents: Array<{ role: string; parts: Array<Record<string, unknown>> }>): Promise<string> {
  try {
    const langInstruction = lang === 'fa'
      ? '\n\n## ACTIVE LANGUAGE: Persian (Farsi)\nThe user interface is in Persian. You MUST respond ONLY in Persian (Farsi). All your responses, questions, and the Project Brief must be in Persian. Use Toman for pricing.\n'
      : '\n\n## ACTIVE LANGUAGE: English\nThe user interface is in English. You MUST respond ONLY in English.\n';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT + langInstruction }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000, topP: 0.9 },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
    }

    const errorBody = await response.text();
    console.error(`[Chat] Model ${MODEL} error: ${response.status} ${errorBody}`);

    if (response.status === 429 || errorBody.includes('RESOURCE_EXHAUSTED') || errorBody.includes('quota')) {
      throw new Error('QUOTA_EXHAUSTED');
    }

    throw new Error(errorBody || `API error ${response.status}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'QUOTA_EXHAUSTED') throw error;

    // Detect network/connection errors
    const msg = String(error);
    const networkHints = ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'fetch failed', 'TypeError', 'network', 'timed out', 'abort'];
    if (networkHints.some(h => msg.toLowerCase().includes(h.toLowerCase()))) {
      console.error(`[Chat] Network error:`, msg);
      throw new Error('NETWORK_ERROR');
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, lang, history, image } = await request.json();

    if ((!message || !message.trim()) && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    // Build conversation contents
    const contents: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        const parts: Array<Record<string, unknown>> = [];
        if (msg.text) parts.push({ text: msg.text });
        if (msg.image) {
          const extracted = extractBase64(msg.image);
          if (extracted) parts.push({ inlineData: { mimeType: extracted.mimeType, data: extracted.data } });
        }
        if (parts.length > 0) {
          contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts });
        }
      }
    }

    const currentParts: Array<Record<string, unknown>> = [];
    if (message && message.trim()) currentParts.push({ text: message.trim() });
    if (image) {
      const extracted = extractBase64(image);
      if (extracted) currentParts.push({ inlineData: { mimeType: extracted.mimeType, data: extracted.data } });
    }
    contents.push({ role: 'user', parts: currentParts });

    const reply = await callGemini(apiKey, lang || 'en', contents);
    return NextResponse.json({ reply });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === 'QUOTA_EXHAUSTED') {
      return NextResponse.json({ error: 'QUOTA_EXHAUSTED' }, { status: 429 });
    }
    if (msg === 'NETWORK_ERROR') {
      return NextResponse.json({ error: 'NETWORK_ERROR' }, { status: 503 });
    }
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
